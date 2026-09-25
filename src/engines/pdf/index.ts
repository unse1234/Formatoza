/**
 * PDF engine: images → PDF (pdf-lib), PDF → images and PDF → text (PDF.js).
 * Both libraries are dynamically imported inside `convert`, so merely opening
 * a PDF tool page downloads neither.
 */
import type { FormatId } from '~/lib/catalog/types';
import { baseName, dedupeNames, outputFileName, sanitizeBaseName } from '~/lib/file/filename';
import { sniffBytes } from '~/lib/file/sniff';
import { textBlob } from '~/lib/file/text';
import { getOptionFields, resolveOptions, type OptionValues } from '../options';
import { OUTPUT_TYPE, matchesFormat } from '../shared/extensions';
import { throwIfAborted, tick, toIssue, validateFiles, warning } from '../shared/engine-utils';
import {
  ConversionError,
  type ConversionContext,
  type ConversionInput,
  type ConversionIssue,
  type ConversionResult,
  type ConverterEngine,
  type OutputFile,
} from '../types';
import { parsePageRange, placeImage } from './pages';
import { itemsToText, type TextItemLike } from './text';

const IMAGE_SOURCES: FormatId[] = ['jpg', 'png', 'webp', 'heic'];
const IMAGE_TARGETS: FormatId[] = ['jpg', 'png', 'webp'];
const MAX_RENDER_PAGES = 300;

async function imagesToPdf(
  input: ConversionInput,
  o: OptionValues,
  ctx?: ConversionContext,
): Promise<ConversionResult> {
  const { PDFDocument } = await import('pdf-lib');
  const { decodeImage } = await import('../image/decode');
  const { drawToCanvas, encodeCanvas, planSize, closeSource, hasTransparency } =
    await import('../image/canvas');
  const { jpegOrientation } = await import('../image/inspect');

  const doc = await PDFDocument.create();
  const errors: ConversionIssue[] = [];
  const warnings: ConversionIssue[] = [];
  const margin = Number(o['margin'] ?? 0);
  const quality = Number(o['quality'] ?? 92) / 100;
  let reencoded = 0;

  for (const [i, file] of input.files.entries()) {
    throwIfAborted(ctx?.signal);
    ctx?.onProgress?.({
      fraction: i / input.files.length,
      label: `Image ${i + 1} of ${input.files.length}`,
    });
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const kind = sniffBytes(bytes);
      let embedded: Awaited<ReturnType<typeof doc.embedJpg>> | undefined;
      // JPEG and PNG are embedded as-is (no quality loss) when possible.
      if (kind === 'jpg' && jpegOrientation(bytes) === 1) {
        try {
          embedded = await doc.embedJpg(bytes);
        } catch {
          embedded = undefined;
        }
      } else if (kind === 'png') {
        try {
          embedded = await doc.embedPng(bytes);
        } catch {
          embedded = undefined;
        }
      }
      if (!embedded) {
        const decoded = await decodeImage(
          file,
          kind === 'unknown' ? input.from : (kind as FormatId),
          {},
        );
        warnings.push(...decoded.warnings.map((w) => ({ ...w, file: file.name })));
        const frame = decoded.frames[0]!;
        try {
          const plan = planSize(frame.width, frame.height);
          // Keep transparency (lossless PNG) only when the image actually uses it.
          const probe = drawToCanvas(frame.source, plan.width, plan.height);
          const hasAlpha = hasTransparency(probe);
          const canvas = hasAlpha
            ? probe
            : drawToCanvas(frame.source, plan.width, plan.height, '#ffffff');
          const blob = await encodeCanvas(canvas, hasAlpha ? 'png' : 'jpg', quality);
          const data = new Uint8Array(await blob.arrayBuffer());
          embedded = hasAlpha ? await doc.embedPng(data) : await doc.embedJpg(data);
          if (!hasAlpha) reencoded++;
        } finally {
          decoded.frames.forEach((f) => closeSource(f.source));
        }
      }
      const place = placeImage(
        { width: embedded.width, height: embedded.height },
        String(o['pageSize'] ?? 'fit'),
        String(o['orientation'] ?? 'auto'),
        margin,
      );
      const page = doc.addPage([place.page.width, place.page.height]);
      page.drawImage(embedded, {
        x: place.x,
        y: place.y,
        width: place.width,
        height: place.height,
      });
    } catch (err) {
      if (err instanceof ConversionError && err.code === 'ABORTED') throw err;
      errors.push(toIssue(err, file.name));
    }
    await tick();
  }
  if (doc.getPageCount() === 0) return { outputs: [], errors, warnings };
  if (reencoded && (input.from === 'webp' || input.from === 'heic'))
    warnings.push(
      warning(
        `PDF cannot store ${input.from === 'heic' ? 'HEIC' : 'WebP'} directly, so ${reencoded} image(s) were stored as JPEG at ${Math.round(quality * 100)}% quality.`,
      ),
    );
  else if (reencoded)
    warnings.push(
      warning(
        `${reencoded} image(s) had to be re-encoded (rotated photos or unusual encodings); all others were embedded unchanged.`,
      ),
    );

  const first = input.files[0]!;
  doc.setTitle(sanitizeBaseName(baseName(first.name), 'Images'));
  doc.setProducer('Formatoza (in-browser, pdf-lib)');
  doc.setCreator('Formatoza');
  const bytes = await doc.save({ useObjectStreams: true });
  ctx?.onProgress?.({ fraction: 1 });
  const name =
    input.files.length === 1
      ? outputFileName(first.name, '.pdf')
      : outputFileName(first.name, '.pdf', '-and-more');
  return {
    outputs: [
      {
        name,
        mimeType: 'application/pdf',
        blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }),
        details: { Pages: String(doc.getPageCount()) },
      },
    ],
    errors,
    warnings,
  };
}

async function pdfToImages(
  input: ConversionInput,
  o: OptionValues,
  ctx?: ConversionContext,
): Promise<ConversionResult> {
  const file = input.files[0]!;
  const { openPdf, renderPage } = await import('./render');
  const { encodeCanvas, planSize, drawToCanvas } = await import('../image/canvas');
  const doc = await openPdf(await file.arrayBuffer());
  const warnings: ConversionIssue[] = [];
  const errors: ConversionIssue[] = [];
  const outputs: OutputFile[] = [];
  try {
    let pages = parsePageRange(String(o['pages'] ?? ''), doc.numPages);
    if (pages.length > MAX_RENDER_PAGES) {
      warnings.push(
        warning(
          `Only the first ${MAX_RENDER_PAGES} selected pages were rendered to protect your browser's memory. Use the page selector for the rest.`,
        ),
      );
      pages = pages.slice(0, MAX_RENDER_PAGES);
    }
    const target = input.to as 'jpg' | 'png' | 'webp';
    const out = OUTPUT_TYPE[input.to];
    const dpi = Number(o['dpi'] ?? 150);
    const quality = Number(o['quality'] ?? 90) / 100;
    const digits = String(doc.numPages).length;
    let limited = false;
    for (const [i, n] of pages.entries()) {
      throwIfAborted(ctx?.signal);
      ctx?.onProgress?.({
        fraction: i / pages.length,
        label: `Page ${n} (${i + 1} of ${pages.length})`,
      });
      try {
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const plan = planSize(
          Math.round((base.width * dpi) / 72),
          Math.round((base.height * dpi) / 72),
        );
        if (plan.limited) limited = true;
        const scale = plan.width / base.width;
        let canvas: HTMLCanvasElement | OffscreenCanvas = await renderPage(
          page,
          scale,
          ctx?.signal,
        );
        if (target === 'jpg') canvas = drawToCanvas(canvas, canvas.width, canvas.height, '#ffffff');
        const blob = await encodeCanvas(canvas, target, quality);
        outputs.push({
          name: outputFileName(file.name, out.ext, `-page-${String(n).padStart(digits, '0')}`),
          mimeType: out.mime,
          blob,
          sourceName: file.name,
          details: {
            Page: `${n} of ${doc.numPages}`,
            Dimensions: `${canvas.width} × ${canvas.height}`,
          },
        });
        page.cleanup();
      } catch (err) {
        if (err instanceof ConversionError && err.code === 'ABORTED') throw err;
        errors.push({ ...toIssue(err, file.name), message: `Page ${n}: ${toIssue(err).message}` });
      }
      await tick();
    }
    if (limited)
      warnings.push(
        warning(
          'Some pages were rendered at a lower resolution to stay within this browser’s canvas limits.',
        ),
      );
  } finally {
    await doc.loadingTask.destroy();
  }
  ctx?.onProgress?.({ fraction: 1 });
  return { outputs, errors, warnings };
}

async function pdfToText(
  input: ConversionInput,
  o: OptionValues,
  ctx?: ConversionContext,
): Promise<ConversionResult> {
  const file = input.files[0]!;
  const { openPdf } = await import('./render');
  const doc = await openPdf(await file.arrayBuffer());
  const warnings: ConversionIssue[] = [];
  const pagesText: string[] = [];
  let emptyPages = 0;
  const pageCount = doc.numPages;
  try {
    for (let n = 1; n <= pageCount; n++) {
      throwIfAborted(ctx?.signal);
      ctx?.onProgress?.({ fraction: (n - 1) / pageCount, label: `Page ${n} of ${pageCount}` });
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      const text = itemsToText(
        content.items.filter((it): it is TextItemLike & typeof it => 'str' in it),
      );
      if (!text.trim()) emptyPages++;
      pagesText.push(o['pageBreaks'] !== false ? `— Page ${n} —\n\n${text}` : text);
      page.cleanup();
      if (n % 10 === 0) await tick();
    }
  } finally {
    await doc.loadingTask.destroy();
  }
  if (emptyPages === pageCount)
    throw new ConversionError(
      'MALFORMED_INPUT',
      'No text layer was found in this PDF. It is probably a scan (pictures of pages); extracting text from it requires OCR, which this tool does not do.',
    );
  if (emptyPages)
    warnings.push(
      warning(`${emptyPages} page(s) contained no extractable text (likely scanned images).`),
    );
  const body = `${pagesText.join('\n\n')}\n`;
  ctx?.onProgress?.({ fraction: 1 });
  return {
    outputs: [
      {
        name: outputFileName(file.name, '.txt'),
        mimeType: 'text/plain',
        blob: textBlob(body, 'text/plain'),
        sourceName: file.name,
        details: {
          Pages: String(pagesText.length),
          Characters: body.length.toLocaleString('en-US'),
        },
      },
    ],
    errors: [],
    warnings,
  };
}

export const pdfEngine: ConverterEngine = {
  id: 'pdf',
  sourceFormats: ['pdf', ...IMAGE_SOURCES],
  targetFormats: ['pdf', 'txt', ...IMAGE_TARGETS],
  supportsBatch: true,
  runsLocally: true,
  canProcess: (file, from) => matchesFormat(file, from),
  validate: (input, limits) => validateFiles(input, limits),

  async convert(input, rawOptions, ctx) {
    const o = resolveOptions(getOptionFields('pdf', input.from, input.to), rawOptions);
    if (input.files.length === 0)
      throw new ConversionError('EMPTY_INPUT', 'Add at least one file.');
    if (input.to === 'pdf' && IMAGE_SOURCES.includes(input.from)) return imagesToPdf(input, o, ctx);
    if (input.from !== 'pdf')
      throw new ConversionError(
        'UNSUPPORTED_FORMAT',
        `${input.from} → ${input.to} is not supported.`,
      );
    // PDF inputs: one document per run (checked by validate); extra files are converted in turn.
    const results: ConversionResult = { outputs: [], errors: [], warnings: [] };
    for (const file of input.files) {
      const head = sniffBytes(new Uint8Array(await file.slice(0, 1024).arrayBuffer()));
      if (head !== 'pdf') {
        results.errors.push({
          code: 'UNSUPPORTED_FORMAT',
          message: 'This file is not a PDF (it does not start with %PDF).',
          file: file.name,
        });
        continue;
      }
      try {
        const single = { ...input, files: [file] };
        const r =
          input.to === 'txt' ? await pdfToText(single, o, ctx) : await pdfToImages(single, o, ctx);
        results.outputs.push(...r.outputs);
        results.errors.push(...r.errors);
        results.warnings.push(...r.warnings.map((w) => ({ ...w, file: w.file ?? file.name })));
      } catch (err) {
        if (err instanceof ConversionError && err.code === 'ABORTED') throw err;
        results.errors.push(toIssue(err, file.name));
      }
    }
    const names = dedupeNames(results.outputs.map((f) => f.name));
    results.outputs.forEach((f, i) => (f.name = names[i]!));
    return results;
  },
};
