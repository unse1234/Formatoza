/**
 * Decoder for Windows DIB bitmaps as found in .bmp files and .ico entries.
 * Supports BI_RGB (1/4/8/24/32 bpp), BI_BITFIELDS (16/32 bpp) and the ICO
 * AND-mask. Pure: returns RGBA pixels, no DOM needed.
 */
import { ConversionError } from '../types';

export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

const MAX_PIXELS = 100_000_000;

function maskShift(mask: number): { shift: number; bits: number } {
  if (!mask) return { shift: 0, bits: 0 };
  let shift = 0;
  while (((mask >>> shift) & 1) === 0) shift++;
  let bits = 0;
  while (((mask >>> (shift + bits)) & 1) === 1) bits++;
  return { shift, bits };
}

function channel(value: number, mask: number): number {
  const { shift, bits } = maskShift(mask);
  if (!bits) return 0;
  const v = (value & mask) >>> shift;
  return Math.round((v * 255) / ((1 << bits) - 1));
}

/**
 * @param bytes  DIB data starting at the BITMAPINFOHEADER
 * @param isIcon ICO entries store doubled height (XOR + AND masks)
 * @param pixelOffset  Offset of pixel data relative to `bytes` (BMP files give it explicitly)
 */
export function decodeDib(bytes: Uint8Array, isIcon: boolean, pixelOffset?: number): RgbaImage {
  if (bytes.length < 40) throw new ConversionError('MALFORMED_INPUT', 'Bitmap header is truncated.');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const headerSize = dv.getUint32(0, true);
  if (headerSize < 40) throw new ConversionError('UNSUPPORTED_FORMAT', 'Old OS/2 bitmap headers are not supported.');
  const width = dv.getInt32(4, true);
  let height = dv.getInt32(8, true);
  const bpp = dv.getUint16(14, true);
  const compression = dv.getUint32(16, true);
  let colorsUsed = dv.getUint32(32, true);
  const topDown = height < 0;
  height = Math.abs(height);
  if (isIcon) height = Math.floor(height / 2);
  if (width <= 0 || height <= 0 || width * height > MAX_PIXELS) throw new ConversionError('MALFORMED_INPUT', 'Invalid bitmap dimensions.');
  if (![0, 3, 6].includes(compression))
    throw new ConversionError('UNSUPPORTED_FORMAT', 'Compressed (RLE/JPEG/PNG) bitmaps are not supported by the fallback decoder.');

  let masks = { r: 0x00ff0000, g: 0x0000ff00, b: 0x000000ff, a: 0xff000000 };
  if (bpp === 16) masks = { r: 0x7c00, g: 0x03e0, b: 0x001f, a: 0 };
  if (compression === 3 || compression === 6) {
    const at = headerSize >= 52 ? 40 : headerSize === 40 ? 40 : 40;
    masks = {
      r: dv.getUint32(at, true),
      g: dv.getUint32(at + 4, true),
      b: dv.getUint32(at + 8, true),
      a: headerSize >= 56 || compression === 6 ? dv.getUint32(at + 12, true) : 0,
    };
  }
  const maskBytes = compression === 3 && headerSize === 40 ? 12 : compression === 6 && headerSize === 40 ? 16 : 0;

  let palette: Uint8Array | undefined;
  const paletteStart = headerSize + maskBytes;
  if (bpp <= 8) {
    if (!colorsUsed) colorsUsed = 1 << bpp;
    palette = bytes.subarray(paletteStart, paletteStart + colorsUsed * 4);
  }
  const dataStart = pixelOffset ?? paletteStart + (palette ? palette.length : 0);
  const rowSize = Math.floor((bpp * width + 31) / 32) * 4;
  if (dataStart + rowSize * height > bytes.length) throw new ConversionError('MALFORMED_INPUT', 'Bitmap pixel data is truncated.');

  const out = new Uint8ClampedArray(width * height * 4);
  let anyAlpha = false;
  for (let y = 0; y < height; y++) {
    const srcRow = dataStart + (topDown ? y : height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      let r = 0, g = 0, b = 0, a = 255;
      if (bpp === 32 || bpp === 16) {
        const v = bpp === 32 ? dv.getUint32(srcRow + x * 4, true) : dv.getUint16(srcRow + x * 2, true);
        if (compression === 0 && bpp === 32) {
          b = v & 0xff; g = (v >>> 8) & 0xff; r = (v >>> 16) & 0xff; a = (v >>> 24) & 0xff;
        } else {
          r = channel(v, masks.r); g = channel(v, masks.g); b = channel(v, masks.b);
          a = masks.a ? channel(v, masks.a) : 255;
        }
        if (a !== 0) anyAlpha = anyAlpha || bpp === 32;
      } else if (bpp === 24) {
        const p = srcRow + x * 3;
        b = bytes[p]!; g = bytes[p + 1]!; r = bytes[p + 2]!;
      } else if (bpp <= 8 && palette) {
        const bitPos = x * bpp;
        const byte = bytes[srcRow + (bitPos >> 3)]!;
        const idx = (byte >> (8 - bpp - (bitPos & 7))) & ((1 << bpp) - 1);
        b = palette[idx * 4] ?? 0; g = palette[idx * 4 + 1] ?? 0; r = palette[idx * 4 + 2] ?? 0;
      } else throw new ConversionError('UNSUPPORTED_FORMAT', `${bpp}-bit bitmaps are not supported.`);
      out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a;
    }
  }
  // 32-bit BI_RGB bitmaps usually leave the 4th byte at 0 meaning "no alpha".
  if (bpp === 32 && compression === 0 && !anyAlpha) for (let i = 3; i < out.length; i += 4) out[i] = 255;

  // ICO AND mask (1 bpp) marks transparent pixels for non-alpha entries.
  if (isIcon && !(bpp === 32 && anyAlpha)) {
    const maskRow = Math.floor((width + 31) / 32) * 4;
    const maskStart = dataStart + rowSize * height;
    if (maskStart + maskRow * height <= bytes.length)
      for (let y = 0; y < height; y++) {
        const row = maskStart + (topDown ? y : height - 1 - y) * maskRow;
        for (let x = 0; x < width; x++) if ((bytes[row + (x >> 3)]! >> (7 - (x & 7))) & 1) out[(y * width + x) * 4 + 3] = 0;
      }
  }
  return { width, height, data: out };
}

/** Decodes a whole .bmp file (with its 14-byte file header). */
export function decodeBmpFile(bytes: Uint8Array): RgbaImage {
  if (bytes.length < 54 || bytes[0] !== 0x42 || bytes[1] !== 0x4d) throw new ConversionError('MALFORMED_INPUT', 'Not a BMP file.');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const pixelOffset = dv.getUint32(10, true);
  return decodeDib(bytes.subarray(14), false, pixelOffset - 14);
}
