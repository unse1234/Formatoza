import type { FormatId } from '~/lib/catalog/types';
import { dedupeNames, outputFileName } from '~/lib/file/filename';
import { getOptionFields, resolveOptions } from '../options';
import { OUTPUT_TYPE, matchesFormat } from '../shared/extensions';
import { runPerFile, throwIfAborted, validateFiles, warning } from '../shared/engine-utils';
import {
  ConversionError,
  type ConversionIssue,
  type ConverterEngine,
  type OutputFile,
} from '../types';
import { closeSource, drawToCanvas, encodeCanvas, planSize, type RasterTarget } from './canvas';
import { decodeImage } from './decode';
import { fitWithin } from './inspect';

const SOURCES: FormatId[] = [
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
const TARGETS: FormatId[] = ['jpg', 'png', 'webp'];

export const imageEngine: ConverterEngine = {
  id: 'image',
  sourceFormats: SOURCES,
  targetFormats: TARGETS,
  supportsBatch: true,
  runsLocally: true,
  canProcess: (file, from) => matchesFormat(file, from),
  validate: (input, limits) => validateFiles(input, limits),

  async convert(input, rawOptions, ctx) {
    if (!SOURCES.includes(input.from) || !TARGETS.includes(input.to))
      throw new ConversionError(
        'UNSUPPORTED_FORMAT',
        `${input.from} → ${input.to} is not supported.`,
      );
    if (typeof createImageBitmap === 'undefined')
      throw new ConversionError(
        'BROWSER_UNSUPPORTED',
        'Your browser does not support in-page image processing. Please update it.',
      );
    const o = resolveOptions(getOptionFields('image', input.from, input.to), rawOptions);
    const target = input.to as RasterTarget;
    const out = OUTPUT_TYPE[input.to];
    const quality = Number(o['quality'] ?? 90) / 100;
    const maxSide = Number(o['maxSide'] ?? 0);

    const result = await runPerFile(input.files, ctx, async (file, _i, report) => {
      const warnings: ConversionIssue[] = [];
      const decoded = await decodeImage(file, input.from, {
        svgScale: String(o['svgScale'] ?? '1'),
        svgWidth: Number(o['svgWidth'] ?? 1024),
        icoEntries: o['icoEntries'] === 'all' ? 'all' : 'largest',
        tiffPages: o['tiffPages'] === 'first' ? 'first' : 'all',
      });
      warnings.push(...decoded.warnings);
      const outputs: OutputFile[] = [];
      try {
        for (const [idx, frame] of decoded.frames.entries()) {
          throwIfAborted(ctx?.signal);
          const wanted = fitWithin(frame.width, frame.height, maxSide);
          const plan = planSize(wanted.width, wanted.height);
          if (plan.limited)
            warnings.push(
              warning(
                `The image was reduced to ${plan.width} × ${plan.height} to stay within this browser's canvas limits.`,
              ),
            );
          const canvas = drawToCanvas(
            frame.source,
            plan.width,
            plan.height,
            target === 'jpg' ? String(o['background'] ?? '#ffffff') : undefined,
          );
          const blob = await encodeCanvas(canvas, target, quality);
          outputs.push({
            name: outputFileName(file.name, out.ext, frame.suffix),
            mimeType: out.mime,
            blob,
            sourceName: file.name,
            details: { Dimensions: `${plan.width} × ${plan.height}` },
          });
          report((idx + 1) / decoded.frames.length);
        }
      } finally {
        decoded.frames.forEach((f) => closeSource(f.source));
      }
      return { outputs, warnings };
    });
    const names = dedupeNames(result.outputs.map((f) => f.name));
    result.outputs.forEach((f, i) => (f.name = names[i]!));
    return result;
  },
};
