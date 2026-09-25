/**
 * Decoders: every supported input format → one or more drawable frames.
 * Heavy decoders (HEIC, TIFF) are dynamically imported only when needed.
 */
import type { FormatId } from '~/lib/catalog/types';
import { sniffBytes } from '~/lib/file/sniff';
import { ConversionError, type ConversionIssue } from '../types';
import { warning } from '../shared/engine-utils';
import { decodeBmpFile, decodeDib, type RgbaImage } from './dib';
import { largestEntry, parseIco } from './ico';
import { countGifFrames, svgIntrinsicSize } from './inspect';
import type { Drawable } from './canvas';

export interface DecodedFrame {
  source: Drawable;
  width: number;
  height: number;
  /** Suffix for the output file name when one input yields several outputs. */
  suffix: string;
  hasAlpha?: boolean;
}

export interface DecodeOptions {
  svgScale?: string;
  svgWidth?: number;
  icoEntries?: 'largest' | 'all';
  tiffPages?: 'all' | 'first';
}

export interface DecodeResult {
  frames: DecodedFrame[];
  warnings: ConversionIssue[];
}

async function bitmapFromRgba(img: RgbaImage): Promise<ImageBitmap> {
  const data = new ImageData(img.data as Uint8ClampedArray<ArrayBuffer>, img.width, img.height);
  return createImageBitmap(data);
}

async function nativeBitmap(blob: Blob): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    return null;
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new ConversionError(
          'MALFORMED_INPUT',
          'The SVG could not be rendered. It may be invalid or rely on unsupported features.',
        ),
      );
    img.src = url;
  });
}

async function decodeSvg(file: Blob, o: DecodeOptions): Promise<DecodeResult> {
  const text = (await file.text()).replace(/^\ufeff/, '');
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = doc.documentElement;
  if (
    !root ||
    root.nodeName.toLowerCase() !== 'svg' ||
    doc.getElementsByTagName('parsererror').length
  )
    throw new ConversionError(
      'MALFORMED_INPUT',
      'This is not a valid SVG file (the XML could not be parsed).',
    );
  const warnings: ConversionIssue[] = [];
  const size = svgIntrinsicSize({
    width: root.getAttribute('width'),
    height: root.getAttribute('height'),
    viewBox: root.getAttribute('viewBox'),
  });
  if (!root.getAttribute('width') && !root.getAttribute('height') && !root.getAttribute('viewBox'))
    warnings.push(
      warning(
        'The SVG declares no size; it was rendered at 300 × 150, the browser default. Use a custom width if that is wrong.',
      ),
    );
  if (/<image[\s>]|<use[^>]+href=["'](?!#)|@import|url\(\s*["']?https?:/i.test(text))
    warnings.push(
      warning(
        'External images, fonts or files referenced by the SVG are not loaded (for security), so they will be missing.',
      ),
    );
  if (/<text[\s>]/i.test(text))
    warnings.push(
      warning(
        'Text in the SVG is drawn with fonts installed on this device; if the original font is missing, a fallback is used.',
      ),
    );

  const scale =
    o.svgScale === 'width'
      ? Math.max(16, o.svgWidth ?? 1024) / size.width
      : Number(o.svgScale ?? 1) || 1;
  const width = Math.max(1, Math.round(size.width * scale));
  const height = Math.max(1, Math.round(size.height * scale));
  // Re-draw the vector at the target size (sharp) instead of upscaling pixels.
  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height));
  if (!root.getAttribute('viewBox'))
    root.setAttribute('viewBox', `0 0 ${size.width} ${size.height}`);
  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const blob = new Blob([new XMLSerializer().serializeToString(root)], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    // <img> never runs SVG scripts or fetches external resources.
    const img = await loadImage(url);
    await img.decode().catch(() => undefined);
    return { frames: [{ source: img, width, height, suffix: '', hasAlpha: true }], warnings };
  } finally {
    // Safe to revoke once decoded; drawing uses the decoded image.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

async function decodeHeic(file: Blob): Promise<DecodeResult> {
  const native = await nativeBitmap(file); // Safari 17+
  if (native)
    return {
      frames: [{ source: native, width: native.width, height: native.height, suffix: '' }],
      warnings: [],
    };
  try {
    const { heicTo } = await import('heic-to/csp');
    const bitmap = await heicTo({ blob: file, type: 'bitmap' });
    return {
      frames: [{ source: bitmap, width: bitmap.width, height: bitmap.height, suffix: '' }],
      warnings: [],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ConversionError(
      'MALFORMED_INPUT',
      `This HEIC image could not be decoded${msg ? ` (${msg.slice(0, 120)})` : ''}. It may be damaged or use an unsupported HEIF variant.`,
    );
  }
}

async function decodeTiff(file: Blob, o: DecodeOptions): Promise<DecodeResult> {
  const buf = await file.arrayBuffer();
  const UTIF = (await import('utif2')).default;
  let ifds: ReturnType<typeof UTIF.decode>;
  try {
    ifds = UTIF.decode(buf).filter((ifd) => ifd['t256'] && ifd['t257']);
  } catch {
    ifds = [];
  }
  if (!ifds.length) {
    const native = await nativeBitmap(new Blob([buf], { type: 'image/tiff' })); // Safari
    if (native)
      return {
        frames: [{ source: native, width: native.width, height: native.height, suffix: '' }],
        warnings: [],
      };
    throw new ConversionError(
      'MALFORMED_INPUT',
      'This TIFF file could not be read. It may be damaged or use an unsupported compression.',
    );
  }
  const warnings: ConversionIssue[] = [];
  const pages = o.tiffPages === 'first' ? ifds.slice(0, 1) : ifds;
  if (o.tiffPages === 'first' && ifds.length > 1)
    warnings.push(warning(`Only the first of ${ifds.length} pages was converted.`));
  const frames: DecodedFrame[] = [];
  for (const [i, ifd] of pages.entries()) {
    try {
      UTIF.decodeImage(buf, ifd);
      const rgba = UTIF.toRGBA8(ifd);
      const width = ifd.width ?? Number((ifd['t256'] as number[])[0]);
      const height = ifd.height ?? Number((ifd['t257'] as number[])[0]);
      if (!width || !height || rgba.length < width * height * 4) throw new Error('bad page');
      const bitmap = await bitmapFromRgba({
        width,
        height,
        data: new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, width * height * 4),
      });
      frames.push({
        source: bitmap,
        width,
        height,
        suffix: pages.length > 1 ? `-page-${i + 1}` : '',
      });
    } catch {
      warnings.push(
        warning(`Page ${i + 1} uses a TIFF encoding that could not be decoded and was skipped.`),
      );
    }
  }
  if (!frames.length)
    throw new ConversionError(
      'MALFORMED_INPUT',
      'None of the pages in this TIFF could be decoded.',
    );
  return { frames, warnings };
}

async function decodeIco(file: Blob, o: DecodeOptions): Promise<DecodeResult> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = parseIco(bytes);
  const chosen =
    o.icoEntries === 'all'
      ? [...entries].sort((a, b) => b.width - a.width)
      : [largestEntry(entries)];
  const frames: DecodedFrame[] = [];
  const warnings: ConversionIssue[] = [];
  const seen = new Set<string>();
  for (const e of chosen) {
    try {
      const data = bytes.subarray(e.offset, e.offset + e.size);
      const source = e.isPng
        ? await createImageBitmap(new Blob([data], { type: 'image/png' }))
        : await bitmapFromRgba(decodeDib(data, true));
      let suffix = chosen.length > 1 ? `-${source.width}x${source.height}` : '';
      if (seen.has(suffix)) suffix = `${suffix}-${e.bitCount}bit`;
      seen.add(suffix);
      frames.push({ source, width: source.width, height: source.height, suffix, hasAlpha: true });
    } catch {
      warnings.push(
        warning(`The ${e.width}×${e.height} icon image could not be decoded and was skipped.`),
      );
    }
  }
  if (!frames.length)
    throw new ConversionError('MALFORMED_INPUT', 'No image inside this icon could be decoded.');
  if (o.icoEntries !== 'all' && entries.length > 1)
    warnings.push(
      warning(
        `The icon contains ${entries.length} sizes; the largest (${frames[0]!.width}×${frames[0]!.height}) was converted. Choose “Every size” in Settings to export all.`,
      ),
    );
  return { frames, warnings };
}

const LABEL: Partial<Record<FormatId, string>> = {
  avif: 'AVIF',
  webp: 'WebP',
  jpg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  bmp: 'BMP',
};

async function decodeNative(file: Blob, from: FormatId): Promise<DecodeResult> {
  const warnings: ConversionIssue[] = [];
  const head = new Uint8Array(await file.slice(0, 64 * 1024).arrayBuffer());
  const actual = sniffBytes(head);
  if (from === 'gif') {
    const frames = countGifFrames(new Uint8Array(await file.arrayBuffer()));
    if (frames > 1)
      warnings.push(
        warning(`This GIF is animated (${frames} frames); the first frame was converted.`),
      );
  }
  const bitmap = await nativeBitmap(file);
  if (bitmap)
    return {
      frames: [{ source: bitmap, width: bitmap.width, height: bitmap.height, suffix: '' }],
      warnings,
    };
  if (from === 'bmp' || actual === 'bmp') {
    const img = decodeBmpFile(new Uint8Array(await file.arrayBuffer()));
    const b = await bitmapFromRgba(img);
    return { frames: [{ source: b, width: b.width, height: b.height, suffix: '' }], warnings };
  }
  if (from === 'avif' && (actual === 'avif' || actual === 'unknown'))
    throw new ConversionError(
      'BROWSER_UNSUPPORTED',
      'This browser cannot decode AVIF images. Use a current version of Chrome, Edge, Firefox (93+) or Safari (16.4+).',
    );
  throw new ConversionError(
    'MALFORMED_INPUT',
    `The ${LABEL[from] ?? from.toUpperCase()} image could not be decoded — the file may be damaged or incomplete.`,
  );
}

/** Detects the real format from the bytes and routes to the right decoder. */
export async function decodeImage(
  file: Blob,
  from: FormatId,
  o: DecodeOptions = {},
): Promise<DecodeResult> {
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const actual = sniffBytes(head);
  const extra: ConversionIssue[] = [];
  let route: FormatId = from;
  const ROUTABLE: FormatId[] = [
    'heic',
    'avif',
    'webp',
    'jpg',
    'png',
    'svg',
    'gif',
    'bmp',
    'tiff',
    'ico',
  ];
  if (actual !== 'unknown' && actual !== from && ROUTABLE.includes(actual as FormatId)) {
    extra.push(
      warning(
        `This file is actually ${actual.toUpperCase()} data despite its name; it was decoded as ${actual.toUpperCase()}.`,
      ),
    );
    route = actual as FormatId;
  } else if (actual === 'pdf' || actual === 'zip') {
    throw new ConversionError(
      'UNSUPPORTED_FORMAT',
      `This file is a ${actual.toUpperCase()}, not an image.`,
    );
  }
  let r: DecodeResult;
  switch (route) {
    case 'svg':
      r = await decodeSvg(file, o);
      break;
    case 'heic':
      r = await decodeHeic(file);
      break;
    case 'tiff':
      r = await decodeTiff(file, o);
      break;
    case 'ico':
      r = await decodeIco(file, o);
      break;
    default:
      r = await decodeNative(file, route);
  }
  return { frames: r.frames, warnings: [...extra, ...r.warnings] };
}
