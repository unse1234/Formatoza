/**
 * Base64 (RFC 4648) and percent-encoding (RFC 3986) helpers — UTF-8 correct,
 * tolerant on input, explicit about what they changed.
 */
import { ConversionError } from '../types';

const encoder = new TextEncoder();

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK)
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  return btoa(binary);
}

export interface Base64EncodeOptions {
  urlSafe: boolean;
  wrap: boolean;
}

export function encodeBase64(text: string, o: Base64EncodeOptions): string {
  let b64 = bytesToBase64(encoder.encode(text.toWellFormed ? text.toWellFormed() : text));
  if (o.urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (o.wrap) b64 = b64.replace(/(.{76})(?=.)/g, '$1\r\n');
  return b64;
}

export interface DecodedBase64 {
  bytes: Uint8Array;
  urlSafe: boolean;
  paddingAdded: boolean;
  dataUrlMime?: string;
}

export function decodeBase64(input: string): DecodedBase64 {
  let s = input.trim();
  let dataUrlMime: string | undefined;
  const dataUrl = /^data:([^;,]*)(?:;[^,]*)?;base64,/i.exec(s);
  if (dataUrl) {
    dataUrlMime = dataUrl[1] || 'application/octet-stream';
    s = s.slice(dataUrl[0].length);
  }
  s = s.replace(/\s+/g, '');
  if (!s) throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  const urlSafe = /[-_]/.test(s);
  if (urlSafe) s = s.replace(/-/g, '+').replace(/_/g, '/');
  const bad = /[^A-Za-z0-9+/=]/.exec(s);
  if (bad)
    throw new ConversionError(
      'MALFORMED_INPUT',
      `“${bad[0]}” at position ${bad.index + 1} is not a Base64 character. Base64 only uses A–Z, a–z, 0–9, + and / (or - and _).`,
    );
  if (/=[^=]/.test(s) || /={3,}$/.test(s))
    throw new ConversionError(
      'MALFORMED_INPUT',
      'Padding “=” can only appear at the very end (at most two).',
    );
  const unpadded = s.replace(/=+$/, '');
  if (unpadded.length % 4 === 1)
    throw new ConversionError(
      'MALFORMED_INPUT',
      'The Base64 input is truncated: its length cannot come from whole bytes.',
    );
  const paddingAdded = s.length % 4 !== 0;
  const padded = unpadded + '='.repeat((4 - (unpadded.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, urlSafe, paddingAdded, ...(dataUrlMime ? { dataUrlMime } : {}) };
}

/** Returns text if the bytes are valid UTF-8 without binary control characters. */
export function bytesAsText(bytes: Uint8Array): string | null {
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    // eslint-disable-next-line no-control-regex
    const controls = (text.match(/[\u0000-\u0008\u000e-\u001f]/g) ?? []).length;
    if (controls > Math.max(2, text.length * 0.01)) return null;
    return text.replace(/^\ufeff/, '');
  } catch {
    return null;
  }
}

// RFC 3986 unreserved characters are never encoded; encodeURIComponent also
// leaves !'()* alone, which RFC 3986 treats as reserved sub-delims.
function strictComponent(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export interface UrlEncodeOptions {
  mode: 'component' | 'uri';
  spacePlus: boolean;
  perLine: boolean;
}

export function urlEncode(text: string, o: UrlEncodeOptions): string {
  const wellFormed = text.toWellFormed ? text.toWellFormed() : text;
  const encodeOne = (s: string) => {
    let out = o.mode === 'uri' ? encodeURI(s) : strictComponent(s);
    if (o.spacePlus) out = out.replace(/%20/g, '+');
    return out;
  };
  if (o.perLine) return wellFormed.split(/\r?\n/).map(encodeOne).join('\n');
  return encodeOne(wellFormed);
}

export interface UrlDecodeResult {
  text: string;
  invalidSequences: number;
  passes: number;
}

function decodeOnce(input: string, plusAsSpace: boolean): { text: string; invalid: number } {
  let invalid = 0;
  const s = plusAsSpace ? input.replace(/\+/g, ' ') : input;
  const text = s.replace(/(?:%[0-9a-f]{2})+/gi, (run) => {
    const bytes = new Uint8Array(run.length / 3);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(run.slice(i * 3 + 1, i * 3 + 3), 16);
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      invalid++;
      return new TextDecoder('windows-1252').decode(bytes);
    }
  });
  return { text, invalid };
}

export function urlDecode(
  input: string,
  o: { plusAsSpace: boolean; repeat: boolean },
): UrlDecodeResult {
  let current = input;
  let invalidSequences = 0;
  let passes = 0;
  do {
    const r = decodeOnce(current, o.plusAsSpace && passes === 0);
    passes++;
    invalidSequences += r.invalid;
    if (r.text === current) break;
    current = r.text;
  } while (o.repeat && passes < 8 && /%[0-9a-f]{2}/i.test(current));
  return { text: current, invalidSequences, passes };
}
