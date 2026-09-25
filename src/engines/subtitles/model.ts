/**
 * Subtitle cue model. Cue text uses a tiny internal markup: plain text with
 * newlines and balanced <i>, <b>, <u> tags only. Parsers normalise into it,
 * writers render out of it.
 */
export interface Cue {
  start: number; // ms
  end: number; // ms
  text: string;
  /** WebVTT cue settings, e.g. "line:0 align:center". */
  settings?: string;
}

export interface ParsedSubtitles {
  cues: Cue[];
  notes: Set<string>;
}

/** Parses "HH:MM:SS,mmm", "MM:SS.mmm", "H:MM:SS.cc" etc. into ms. */
export function parseTimestamp(raw: string): number | null {
  const m = /^\s*(?:(\d+):)?(\d{1,2}):(\d{1,2})(?:[,.:](\d{1,3}))?\s*$/.exec(raw);
  if (!m) return null;
  const [, h = '0', min, s, frac = '0'] = m;
  const ms = Math.round(Number(`0.${frac}`) * 1000);
  const minutes = Number(min);
  const seconds = Number(s);
  if (seconds >= 60 || (m[1] !== undefined && minutes >= 60)) return null;
  return ((Number(h) * 60 + minutes) * 60 + seconds) * 1000 + ms;
}

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0');
}

export function formatTimestamp(ms: number, style: 'srt' | 'vtt' | 'ass' | 'txt'): string {
  const total = Math.max(0, Math.round(ms));
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const milli = total % 1000;
  switch (style) {
    case 'srt':
      return `${pad(h)}:${pad(m)}:${pad(s)},${pad(milli, 3)}`;
    case 'vtt':
      return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(milli, 3)}`;
    case 'ass': {
      const cs = Math.round(total / 10);
      const hh = Math.floor(cs / 360_000);
      const mm = Math.floor((cs % 360_000) / 6000);
      const ss = Math.floor((cs % 6000) / 100);
      return `${hh}:${pad(mm)}:${pad(ss)}.${pad(cs % 100)}`;
    }
    case 'txt':
      return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }
}

const ENTITY: Record<string, string> = { amp: '&', lt: '<', gt: '>', nbsp: ' ', lrm: '‎', rlm: '‏', quot: '"', apos: "'" };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : all;
    }
    return ENTITY[e.toLowerCase()] ?? all;
  });
}

/**
 * Normalises HTML-ish cue markup (SRT/VTT) into the internal subset.
 * Unknown tags are removed; their text content is kept.
 */
export function normalizeMarkup(text: string, notes: Set<string>): string {
  let out = text.replace(/<\s*(\/?)\s*([a-z0-9]+)(?:[.\s][^>]*)?>/gi, (_all, close: string, tag: string) => {
    const t = tag.toLowerCase();
    if (t === 'i' || t === 'b' || t === 'u') return `<${close}${t}>`;
    if (t === 'font') notes.add('Font colors and faces were removed (the target format cannot express them).');
    else if (t === 'v') notes.add('Speaker (voice) tags were removed; the spoken text is kept.');
    else if (t === 'c' || t === 'lang' || t === 'span') notes.add('WebVTT class and language spans were removed; their text is kept.');
    else if (t === 'ruby' || t === 'rt') notes.add('Ruby annotations were flattened into plain text.');
    return '';
  });
  // WebVTT inline timestamps (karaoke) <00:00:01.000>
  out = out.replace(/<\d{1,2}:\d{2}(?::\d{2})?\.\d{3}>/g, () => {
    notes.add('Inline karaoke timestamps were removed.');
    return '';
  });
  return balanceTags(out);
}

/** Ensures <i>/<b>/<u> are properly nested and closed. */
export function balanceTags(text: string): string {
  const stack: string[] = [];
  let out = '';
  const re = /<(\/?)([ibu])>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    out += text.slice(last, m.index);
    last = re.lastIndex;
    const [, close, tag] = m as unknown as [string, string, string];
    if (!close) {
      if (!stack.includes(tag)) {
        stack.push(tag);
        out += `<${tag}>`;
      }
    } else if (stack.includes(tag)) {
      // close everything opened after it, then reopen those
      const reopen: string[] = [];
      while (stack.length) {
        const top = stack.pop()!;
        out += `</${top}>`;
        if (top === tag) break;
        reopen.unshift(top);
      }
      for (const r of reopen) {
        stack.push(r);
        out += `<${r}>`;
      }
    }
  }
  out += text.slice(last);
  while (stack.length) out += `</${stack.pop()}>`;
  return out.replace(/<([ibu])><\/\1>/g, '');
}

export function stripMarkup(text: string): string {
  return text.replace(/<\/?[ibu]>/g, '');
}
