/**
 * Output file-name handling. Input names are untrusted: they may contain path
 * separators, control characters, bidi overrides, reserved Windows names, or be
 * absurdly long. Output names must be safe to save on every OS.
 */

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
// Control chars, bidi/format controls and characters invalid on Windows/macOS.
// eslint-disable-next-line no-control-regex
const UNSAFE_CHARS = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿<>:"/\\|?*]/g;
const MAX_BASE_LENGTH = 120;

/** Strips any directory part and the final extension. */
export function baseName(name: string): string {
  const last = name.split(/[\\/]/).pop() ?? '';
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(0, dot) : last;
}

export function extensionOf(name: string): string {
  const last = name.split(/[\\/]/).pop() ?? '';
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(dot).toLowerCase() : '';
}

export function sanitizeBaseName(input: string, fallback = 'converted'): string {
  let s = input.normalize('NFC').replace(UNSAFE_CHARS, '_');
  s = s.replace(/\s+/g, ' ').replace(/_+/g, '_').trim();
  s = s.replace(/^[.\s]+|[.\s]+$/g, ''); // no leading dots (hidden files) or trailing dots/spaces (Windows)
  if (!s || /^_+$/.test(s)) s = fallback;
  if (WINDOWS_RESERVED.test(s)) s = `${s}_file`;
  // Truncate by code point so surrogate pairs (emoji) are never split.
  const chars = Array.from(s);
  if (chars.length > MAX_BASE_LENGTH) s = chars.slice(0, MAX_BASE_LENGTH).join('').trim();
  return s;
}

/**
 * `IMG_1234.HEIC` + `.jpg` → `IMG_1234.jpg`; `../../etc/passwd` → `passwd.txt`.
 * `suffix` is appended before the extension, e.g. `-page-2`.
 */
export function outputFileName(inputName: string, extension: string, suffix = ''): string {
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return `${sanitizeBaseName(baseName(inputName))}${suffix}${ext.toLowerCase()}`;
}

/** Makes names unique within one batch: `a.jpg`, `a (2).jpg`, … */
export function dedupeNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((n) => {
    const key = n.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count === 0) return n;
    const ext = extensionOf(n);
    const base = ext ? n.slice(0, -ext.length) : n;
    let candidate = `${base} (${count + 1})${ext}`;
    while (seen.has(candidate.toLowerCase())) candidate = `${base} (${count + 2})${ext}`;
    seen.set(candidate.toLowerCase(), 1);
    return candidate;
  });
}
