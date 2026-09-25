import type { FormatId } from '~/lib/catalog/types';
import { dedupeNames, outputFileName } from '~/lib/file/filename';
import { readText, textBlob } from '~/lib/file/text';
import { getOptionFields, resolveOptions } from '../options';
import { OUTPUT_TYPE, matchesFormat } from '../shared/extensions';
import { runPerFile, throwIfAborted, validateFiles, warning } from '../shared/engine-utils';
import { ConversionError, type ConversionIssue, type ConverterEngine } from '../types';
import type { Cue, ParsedSubtitles } from './model';
import { parseAss, parseSrt, parseVtt } from './parse';
import { writeAss, writeSrt, writeTxt, writeVtt } from './write';

const SOURCES: FormatId[] = ['srt', 'vtt', 'ass'];
const TARGETS: FormatId[] = ['srt', 'vtt', 'ass', 'txt'];

function parse(text: string, from: FormatId): ParsedSubtitles {
  if (from === 'srt') return parseSrt(text);
  if (from === 'vtt') return parseVtt(text);
  if (from === 'ass') return parseAss(text);
  throw new ConversionError('UNSUPPORTED_FORMAT', `Cannot read ${from}.`);
}

/** Sorts, shifts and repairs cues; returns human-readable notes about fixes. */
export function prepareCues(input: Cue[], offsetMs: number): { cues: Cue[]; notes: string[] } {
  const notes: string[] = [];
  let cues = input.map((c) => ({ ...c }));
  const sorted = [...cues].sort((a, b) => a.start - b.start || a.end - b.end);
  if (sorted.some((c, i) => c !== cues[i]))
    notes.push('Cues were out of order and have been sorted by start time.');
  cues = sorted;
  let fixed = 0;
  for (const c of cues)
    if (c.end <= c.start) {
      c.end = c.start + 1000;
      fixed++;
    }
  if (fixed)
    notes.push(
      `${fixed} cue(s) ended before they started; their end time was set to 1 s after the start.`,
    );
  if (offsetMs) {
    const before = cues.length;
    cues = cues
      .map((c) => ({ ...c, start: c.start + offsetMs, end: c.end + offsetMs }))
      .filter((c) => c.end > 0)
      .map((c) => ({ ...c, start: Math.max(0, c.start) }));
    if (cues.length < before)
      notes.push(
        `${before - cues.length} cue(s) fell before 0:00 after shifting and were removed.`,
      );
  }
  return { cues, notes };
}

export const subtitlesEngine: ConverterEngine = {
  id: 'subtitles',
  sourceFormats: SOURCES,
  targetFormats: TARGETS,
  supportsBatch: true,
  runsLocally: true,
  canProcess: (file, from) => matchesFormat(file, from),
  validate: (input, limits) => validateFiles(input, limits),

  async convert(input, rawOptions, ctx) {
    if (!SOURCES.includes(input.from) || !TARGETS.includes(input.to) || input.from === input.to)
      throw new ConversionError(
        'UNSUPPORTED_FORMAT',
        `${input.from} → ${input.to} is not supported.`,
      );
    const o = resolveOptions(getOptionFields('subtitles', input.from, input.to), rawOptions);
    const out = OUTPUT_TYPE[input.to];
    const result = await runPerFile(input.files, ctx, async (file) => {
      const { text, encoding } = await readText(file);
      throwIfAborted(ctx?.signal);
      const warnings: ConversionIssue[] = [];
      if (encoding === 'windows-1252')
        warnings.push(
          warning(
            'The file was not valid UTF-8 and was read as Windows-1252 (Western European). The output is UTF-8.',
          ),
        );
      const parsed = parse(text, input.from);
      const { cues, notes } = prepareCues(
        parsed.cues,
        input.to === 'txt' ? 0 : Number(o['offsetMs'] ?? 0),
      );
      if (input.to !== 'txt') for (const n of parsed.notes) warnings.push(warning(n));
      for (const n of notes) warnings.push(warning(n));

      let body: string;
      switch (input.to) {
        case 'srt':
          body = writeSrt(cues);
          break;
        case 'vtt':
          body = writeVtt(cues);
          break;
        case 'ass': {
          const [w, h] = String(o['resolution'] ?? '1920x1080')
            .split('x')
            .map(Number);
          if (cues.some((c) => c.start % 10 !== 0 || c.end % 10 !== 0))
            warnings.push(
              warning(
                'ASS stores time in hundredths of a second, so timings were rounded to the nearest 10 ms.',
              ),
            );
          body = writeAss(cues, {
            fontName: String(o['fontName']),
            fontSize: Number(o['fontSize']),
            width: w ?? 1920,
            height: h ?? 1080,
          });
          break;
        }
        default:
          body = writeTxt(cues, {
            timestamps: o['timestamps'] === true,
            paragraphs: o['paragraphs'] !== false,
            dedupe: o['dedupe'] !== false,
          });
      }
      return {
        outputs: [
          {
            name: outputFileName(file.name, out.ext),
            mimeType: out.mime,
            blob: textBlob(body, out.mime),
            sourceName: file.name,
            details: { Cues: cues.length.toLocaleString('en-US') },
          },
        ],
        warnings,
      };
    });
    const names = dedupeNames(result.outputs.map((f) => f.name));
    result.outputs.forEach((f, i) => (f.name = names[i]!));
    return result;
  },
};
