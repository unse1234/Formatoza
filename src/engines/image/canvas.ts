/**
 * Canvas helpers shared by the image and PDF engines (browser only).
 */
import { ConversionError } from '../types';
import { fitCanvasLimits } from './inspect';

export type Drawable = ImageBitmap | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas;
type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

const isAppleMobile = () =>
  typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/** Conservative per-browser canvas limits (iOS Safari caps canvases at 16.7 MP). */
export function canvasLimits(): { maxArea: number; maxDim: number } {
  return isAppleMobile() ? { maxArea: 16_777_216, maxDim: 16_384 } : { maxArea: 268_435_456, maxDim: 16_384 };
}

export function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(width, height);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  return c;
}

function context2d(canvas: AnyCanvas): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  const ctx = canvas.getContext('2d', { alpha: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) throw new ConversionError('BROWSER_UNSUPPORTED', 'Your browser could not create a drawing surface of this size. Try a smaller output size.');
  return ctx;
}

export interface RenderPlan {
  width: number;
  height: number;
  /** True when the size was reduced to fit browser limits (not by the user). */
  limited: boolean;
}

export function planSize(width: number, height: number): RenderPlan {
  const { maxArea, maxDim } = canvasLimits();
  const f = fitCanvasLimits(width, height, maxArea, maxDim);
  return { width: f.width, height: f.height, limited: f.scaled };
}

/** Draws a source onto a new canvas, optionally over a solid background. */
export function drawToCanvas(source: Drawable, width: number, height: number, background?: string): AnyCanvas {
  const canvas = createCanvas(width, height);
  const ctx = context2d(canvas);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source as CanvasImageSource, 0, 0, width, height);
  return canvas;
}

async function canvasToBlob(canvas: AnyCanvas, type: string, quality?: number): Promise<Blob | null> {
  if ('convertToBlob' in canvas) {
    try {
      return await canvas.convertToBlob({ type, ...(quality !== undefined ? { quality } : {}) });
    } catch {
      return null;
    }
  }
  return new Promise((resolve) => (canvas as HTMLCanvasElement).toBlob(resolve, type, quality));
}

export function imageDataOf(canvas: AnyCanvas): ImageData {
  return context2d(canvas).getImageData(0, 0, canvas.width, canvas.height);
}

let webpSupport: Promise<boolean> | undefined;

/** Safari (and some older browsers) cannot *encode* WebP from a canvas. */
export function canEncodeWebp(): Promise<boolean> {
  webpSupport ??= (async () => {
    try {
      const b = await canvasToBlob(createCanvas(2, 2), 'image/webp', 0.8);
      return b?.type === 'image/webp';
    } catch {
      return false;
    }
  })();
  return webpSupport;
}

export type RasterTarget = 'jpg' | 'png' | 'webp';
const MIME: Record<RasterTarget, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/** Encodes a canvas into the target format; WebP falls back to a WASM encoder when needed. */
export async function encodeCanvas(canvas: AnyCanvas, target: RasterTarget, quality01: number): Promise<Blob> {
  const mime = MIME[target];
  if (target === 'webp' && !(await canEncodeWebp())) {
    const { encode } = await import('@jsquash/webp');
    const q = Math.round(quality01 * 100);
    const buf = await encode(imageDataOf(canvas), q >= 100 ? { lossless: 1 } : { quality: q });
    return new Blob([buf], { type: mime });
  }
  const blob = await canvasToBlob(canvas, mime, target === 'png' ? undefined : quality01);
  if (!blob || blob.size === 0)
    throw new ConversionError('BROWSER_UNSUPPORTED', 'Your browser failed to encode the image — it may be too large for this device. Try a smaller output size.');
  if (blob.type !== mime) throw new ConversionError('BROWSER_UNSUPPORTED', `Your browser cannot write ${target.toUpperCase()} images.`);
  return blob;
}

/** True if any pixel is not fully opaque (scans the alpha channel, exits early). */
export function hasTransparency(canvas: AnyCanvas): boolean {
  const { data } = imageDataOf(canvas);
  for (let i = 3; i < data.length; i += 4) if (data[i]! < 255) return true;
  return false;
}

export function closeSource(source: Drawable): void {
  if ('close' in source && typeof source.close === 'function') source.close();
}
