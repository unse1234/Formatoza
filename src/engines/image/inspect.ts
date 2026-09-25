/** Small pure helpers for image files (no DOM). */

/** Counts image frames in a GIF by walking its block structure. */
export function countGifFrames(bytes: Uint8Array): number {
  if (bytes.length < 13 || String.fromCharCode(...bytes.subarray(0, 3)) !== 'GIF') return 0;
  let p = 13;
  const flags = bytes[10]!;
  if (flags & 0x80) p += 3 * (1 << ((flags & 7) + 1));
  let frames = 0;
  const skipSubBlocks = () => {
    while (p < bytes.length) {
      const len = bytes[p]!;
      p += 1;
      if (len === 0) break;
      p += len;
    }
  };
  while (p < bytes.length) {
    const b = bytes[p]!;
    if (b === 0x3b) break; // trailer
    if (b === 0x21) {
      p += 2;
      skipSubBlocks();
    } else if (b === 0x2c) {
      frames++;
      const lflags = bytes[p + 9] ?? 0;
      p += 10;
      if (lflags & 0x80) p += 3 * (1 << ((lflags & 7) + 1));
      p += 1; // LZW min code size
      skipSubBlocks();
    } else break;
  }
  return frames;
}

/** Reads the EXIF orientation (1–8) from a JPEG, 1 if absent. */
export function jpegOrientation(bytes: Uint8Array): number {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return 1;
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let p = 2;
  while (p + 4 < bytes.length) {
    if (bytes[p] !== 0xff) return 1;
    const marker = bytes[p + 1]!;
    const len = dv.getUint16(p + 2);
    if (marker === 0xe1 && String.fromCharCode(...bytes.subarray(p + 4, p + 8)) === 'Exif') {
      const t = p + 10;
      const little = dv.getUint16(t) === 0x4949;
      const ifd = t + dv.getUint32(t + 4, little);
      if (ifd + 2 > bytes.length) return 1;
      const n = dv.getUint16(ifd, little);
      for (let i = 0; i < n; i++) {
        const e = ifd + 2 + i * 12;
        if (e + 12 > bytes.length) break;
        if (dv.getUint16(e, little) === 0x0112) {
          const v = dv.getUint16(e + 8, little);
          return v >= 1 && v <= 8 ? v : 1;
        }
      }
      return 1;
    }
    if (marker === 0xda || marker === 0xd9) return 1;
    p += 2 + len;
  }
  return 1;
}

/** Longest-side downscale; never upscales. */
export function fitWithin(
  width: number,
  height: number,
  maxSide: number,
): { width: number; height: number } {
  if (!maxSide || Math.max(width, height) <= maxSide) return { width, height };
  const s = maxSide / Math.max(width, height);
  return { width: Math.max(1, Math.round(width * s)), height: Math.max(1, Math.round(height * s)) };
}

/** Scales down to respect a browser's canvas area / dimension limits. */
export function fitCanvasLimits(
  width: number,
  height: number,
  maxArea: number,
  maxDim: number,
): { width: number; height: number; scaled: boolean } {
  let s = 1;
  if (width * height > maxArea) s = Math.sqrt(maxArea / (width * height));
  if (Math.max(width, height) * s > maxDim) s = maxDim / Math.max(width, height);
  if (s >= 1) return { width, height, scaled: false };
  return {
    width: Math.max(1, Math.floor(width * s)),
    height: Math.max(1, Math.floor(height * s)),
    scaled: true,
  };
}

export interface SvgSize {
  width: number;
  height: number;
  fromViewBox: boolean;
}

function length(v: string | null | undefined): number | null {
  if (!v) return null;
  const m = /^\s*([\d.]+)\s*(px|pt|pc|mm|cm|in)?\s*$/i.exec(v);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = (m[2] ?? 'px').toLowerCase();
  const factor: Record<string, number> = {
    px: 1,
    pt: 4 / 3,
    pc: 16,
    mm: 96 / 25.4,
    cm: 96 / 2.54,
    in: 96,
  };
  return Number.isFinite(n) && n > 0 ? n * factor[unit]! : null;
}

/** Intrinsic SVG size from width/height/viewBox attributes (percentages ignored). */
export function svgIntrinsicSize(attrs: {
  width?: string | null;
  height?: string | null;
  viewBox?: string | null;
}): SvgSize {
  const w = length(attrs.width);
  const h = length(attrs.height);
  const vb = attrs.viewBox
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const vbOk = vb && vb.length === 4 && vb[2]! > 0 && vb[3]! > 0;
  if (w && h) return { width: w, height: h, fromViewBox: false };
  if (vbOk) {
    const ratio = vb[3]! / vb[2]!;
    if (w) return { width: w, height: w * ratio, fromViewBox: true };
    if (h) return { width: h / ratio, height: h, fromViewBox: true };
    return { width: vb[2]!, height: vb[3]!, fromViewBox: true };
  }
  return { width: w ?? 300, height: h ?? 150, fromViewBox: false };
}
