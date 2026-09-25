/**
 * PDF.js loader and page access (browser only). Loaded lazily, only by PDF → X tools.
 * Uses the "legacy" build: PDF.js 6 relies on very new JS built-ins
 * (e.g. Map.prototype.getOrInsertComputed) that the legacy build polyfills,
 * so PDFs also work in browsers that are a year or two old.
 */
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { ConversionError } from '../types';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const ASSETS = '/vendor/pdfjs';

export async function openPdf(data: ArrayBuffer): Promise<pdfjs.PDFDocumentProxy> {
  const task = pdfjs.getDocument({
    data: new Uint8Array(data),
    cMapUrl: `${ASSETS}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${ASSETS}/standard_fonts/`,
    wasmUrl: `${ASSETS}/wasm/`,
    iccUrl: `${ASSETS}/iccs/`,
    enableXfa: false,
    stopAtErrors: false,
  });
  try {
    return await task.promise;
  } catch (err) {
    const name = (err as { name?: string })?.name ?? '';
    if (name === 'PasswordException')
      throw new ConversionError(
        'ENCRYPTED',
        'This PDF is password-protected. Open it in a PDF reader, remove the password (or print to a new PDF), then try again.',
      );
    if (name === 'InvalidPDFException')
      throw new ConversionError('MALFORMED_INPUT', 'This file is not a valid PDF or is damaged.');
    throw new ConversionError(
      'MALFORMED_INPUT',
      `The PDF could not be opened: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export type PdfPage = pdfjs.PDFPageProxy;

export async function renderPage(
  page: PdfPage,
  scale: number,
  signal?: AbortSignal,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const task = page.render({ canvas, viewport, background: 'rgb(255,255,255)', intent: 'print' });
  const onAbort = () => task.cancel();
  signal?.addEventListener('abort', onAbort, { once: true });
  try {
    await task.promise;
  } catch (err) {
    if (signal?.aborted) throw new ConversionError('ABORTED', 'Conversion cancelled.');
    throw err;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
  return canvas;
}
