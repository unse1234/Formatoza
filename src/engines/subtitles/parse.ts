import { ConversionError } from '../types';
import {
  decodeEntities,
  normalizeMarkup,
  parseTimestamp,
  balanceTags,
  type Cue,
  type ParsedSubtitles,
} from './model';

const ARROW = /^\s*(\S+)\s+-{1,2}>\s+(\S+)(.*)$/;

export type SubtitleFormat = 'srt' | 'vtt' | 'ass';

export function detectSubtitleFormat(text: string): SubtitleFormat | null {
  const head = text
    .replace(/^\ufeff/, '')
    .trimStart()
    .slice(0, 2000);
  if (/^WEBVTT/.test(head)) return 'vtt';
  if (/^\[Script Info\]/im.test(head) || /^\[V4\+? Styles\]/im.test(head)) return 'ass';
  if (
    /^\d+\s*\r?\n\s*\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}\s*-->/m.test(head) ||
    /\d{1,2}:\d{2}:\d{2},\d{1,3}\s*-->/.test(head)
  )
    return 'srt';
  return null;
}

function splitBlocks(text: string): string[][] {
  return text
    .replace(/^\ufeff/, '')
    .replace(/\r\n?/g, '\n')
    .split(/\n[ \t]*\n+/)
    .map((b) => b.split('\n'))
    .filter((lines) => lines.some((l) => l.trim()));
}

function wrongFormat(expected: SubtitleFormat, text: string): never {
  const actual = detectSubtitleFormat(text);
  const hint =
    actual && actual !== expected
      ? ` It looks like a ${actual.toUpperCase()} file — use the ${actual.toUpperCase()} converter instead.`
      : '';
  throw new ConversionError(
    'MALFORMED_INPUT',
    `No ${expected.toUpperCase()} cues were found.${hint}`,
  );
}

export function parseSrt(text: string): ParsedSubtitles {
  if (!text.trim()) throw new ConversionError('EMPTY_INPUT', 'The subtitle file is empty.');
  const notes = new Set<string>();
  const cues: Cue[] = [];
  let skipped = 0;
  for (const lines of splitBlocks(text)) {
    const arrowIdx = lines.findIndex((l) => l.includes('-->'));
    if (arrowIdx === -1 || arrowIdx > 1) {
      skipped++;
      continue;
    }
    const m = ARROW.exec(lines[arrowIdx]!);
    const start = m ? parseTimestamp(m[1]!) : null;
    const end = m ? parseTimestamp(m[2]!) : null;
    if (start === null || end === null) {
      skipped++;
      continue;
    }
    let body = lines
      .slice(arrowIdx + 1)
      .join('\n')
      .trim();
    const pos = /^\{\\an([1-9])\}/.exec(body);
    let settings: string | undefined;
    if (pos) {
      body = body.slice(pos[0].length);
      const n = Number(pos[1]);
      if (n >= 7) settings = 'line:0';
      else if (n >= 4) settings = 'line:50%';
    }
    if (/\{\\[^}]*\}/.test(body)) {
      notes.add('ASS-style override tags inside the SRT were removed.');
      body = body.replace(/\{\\[^}]*\}/g, '');
    }
    cues.push({
      start,
      end,
      text: normalizeMarkup(body, notes),
      ...(settings ? { settings } : {}),
    });
  }
  if (cues.length === 0) wrongFormat('srt', text);
  if (skipped) notes.add(`${skipped} block(s) without a valid timestamp line were skipped.`);
  return { cues, notes };
}

export function parseVtt(text: string): ParsedSubtitles {
  if (!text.trim()) throw new ConversionError('EMPTY_INPUT', 'The subtitle file is empty.');
  const notes = new Set<string>();
  const blocks = splitBlocks(text);
  if (!/^WEBVTT/.test(blocks[0]?.[0]?.trim() ?? ''))
    notes.add('The file did not start with the required “WEBVTT” line; it was read anyway.');
  const cues: Cue[] = [];
  for (const lines of blocks) {
    const first = lines[0]!.trim();
    if (/^WEBVTT/.test(first) && !lines.some((l) => l.includes('-->'))) continue;
    if (/^(NOTE|STYLE|REGION)\b/.test(first)) {
      if (first.startsWith('STYLE')) notes.add('WebVTT STYLE blocks (CSS) were not carried over.');
      if (first.startsWith('REGION')) notes.add('WebVTT regions were not carried over.');
      continue;
    }
    // The header block may contain the first cue when there's no blank line after metadata.
    const arrowIdx = lines.findIndex((l) => l.includes('-->'));
    if (arrowIdx === -1) continue;
    const m = ARROW.exec(lines[arrowIdx]!);
    const start = m ? parseTimestamp(m[1]!) : null;
    const end = m ? parseTimestamp(m[2]!) : null;
    if (start === null || end === null) continue;
    const settings = m?.[3]?.trim();
    const body = decodeEntities(
      normalizeMarkup(
        lines
          .slice(arrowIdx + 1)
          .join('\n')
          .trim(),
        notes,
      ),
    );
    cues.push({ start, end, text: body, ...(settings ? { settings } : {}) });
  }
  if (cues.length === 0) wrongFormat('vtt', text);
  return { cues, notes };
}

/** Splits an ASS Dialogue payload by the Format field order; Text is last and may contain commas. */
function splitFields(payload: string, count: number): string[] {
  const parts: string[] = [];
  let rest = payload;
  for (let i = 0; i < count - 1; i++) {
    const idx = rest.indexOf(',');
    if (idx === -1) break;
    parts.push(rest.slice(0, idx));
    rest = rest.slice(idx + 1);
  }
  parts.push(rest);
  return parts;
}

export function assTextToMarkup(raw: string, notes: Set<string>): string {
  let text = '';
  let drawing = false;
  const re = /\{([^}]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const emit = (s: string) => {
    if (!drawing) text += s;
  };
  while ((m = re.exec(raw))) {
    emit(raw.slice(last, m.index));
    last = re.lastIndex;
    const block = m[1]!;
    if (!block.includes('\\')) continue; // comment block
    const tags = block.split('\\').filter(Boolean);
    for (const t of tags) {
      const tm = /^(i|b|u)(\d+)?$/.exec(t);
      if (tm) {
        const on = tm[2] === undefined ? true : Number(tm[2]) !== 0;
        emit(on ? `<${tm[1]}>` : `</${tm[1]}>`);
        continue;
      }
      const p = /^p(\d+)$/.exec(t);
      if (p) {
        drawing = Number(p[1]) > 0;
        if (drawing) notes.add('Vector drawings ({\\p} blocks) were removed.');
        continue;
      }
      if (/^(k|K|kf|ko)\d/.test(t)) notes.add('Karaoke timing tags were removed.');
      else if (
        /^(pos|move|an|a\d|org|fad|fade|frz|fr|t\(|clip|iclip|c|1c|2c|3c|4c|fn|fs|bord|shad|blur|be)/.test(
          t,
        )
      )
        notes.add(
          'Positioning, colors, fonts and animation tags were removed (only italic, bold and underline survive).',
        );
    }
  }
  emit(raw.slice(last));
  text = text.replace(/\\N/g, '\n').replace(/\\n/g, '\n').replace(/\\h/g, '\u00a0');
  return balanceTags(text.trim());
}

export function parseAss(text: string): ParsedSubtitles {
  if (!text.trim()) throw new ConversionError('EMPTY_INPUT', 'The subtitle file is empty.');
  const notes = new Set<string>();
  const lines = text
    .replace(/^\ufeff/, '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  let section = '';
  let format: string[] = [
    'Layer',
    'Start',
    'End',
    'Style',
    'Name',
    'MarginL',
    'MarginR',
    'MarginV',
    'Effect',
    'Text',
  ];
  const cues: Cue[] = [];
  let styles = 0;
  let comments = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    const sec = /^\[(.+)\]$/.exec(trimmed);
    if (sec) {
      section = sec[1]!.toLowerCase();
      continue;
    }
    if (section.includes('styles') && /^Style:/i.test(trimmed)) styles++;
    if (section !== 'events') continue;
    if (/^Format:/i.test(trimmed)) {
      format = trimmed
        .slice(7)
        .split(',')
        .map((s) => s.trim());
      continue;
    }
    if (/^Comment:/i.test(trimmed)) {
      comments++;
      continue;
    }
    if (!/^Dialogue:/i.test(trimmed)) continue;
    const fields = splitFields(line.slice(line.indexOf(':') + 1).trimStart(), format.length);
    const get = (name: string) => fields[format.findIndex((f) => f.toLowerCase() === name)] ?? '';
    const start = parseTimestamp(get('start'));
    const end = parseTimestamp(get('end'));
    if (start === null || end === null) continue;
    const body = assTextToMarkup(get('text'), notes);
    if (!body) continue;
    cues.push({ start, end, text: body });
  }
  if (cues.length === 0) wrongFormat('ass', text);
  if (styles > 0)
    notes.add(
      `${styles} ASS style definition(s) were dropped; the target format has no named styles.`,
    );
  if (comments > 0) notes.add(`${comments} commented-out line(s) were skipped.`);
  return { cues, notes };
}
