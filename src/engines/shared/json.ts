import { ConversionError, type ConversionIssue } from '../types';
import { warning } from './engine-utils';

function lineCol(text: string, pos: number): { line: number; col: number } {
  const before = text.slice(0, pos);
  return { line: before.split('\n').length, col: pos - before.lastIndexOf('\n') };
}

/**
 * Finds the offset and reason of the first JSON syntax error. Browsers word
 * JSON.parse errors differently (Safari gives no position at all), so we
 * locate errors ourselves for consistent “line X, column Y” messages.
 */
export function locateJsonError(s: string): { pos: number; reason: string } | null {
  let i = 0;
  const ws = () => {
    while (i < s.length && (s[i] === ' ' || s[i] === '\t' || s[i] === '\n' || s[i] === '\r')) i++;
  };
  const fail = (reason: string): never => {
    throw { pos: i, reason };
  };
  const str = () => {
    i++; // opening quote
    while (i < s.length) {
      const c = s[i]!;
      if (c === '"') {
        i++;
        return;
      }
      if (c === '\\') {
        const n = s[i + 1];
        if (n === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(s.slice(i + 2, i + 6))) fail('invalid \\u escape');
          i += 6;
        } else if (n !== undefined && '"\\/bfnrt'.includes(n)) i += 2;
        else fail('invalid escape sequence');
      } else if (c < ' ') fail('unescaped control character (e.g. a raw line break) in a string');
      else i++;
    }
    fail('unterminated string');
  };
  const num = () => {
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(s.slice(i));
    if (!m || !m[0] || m[0] === '-') fail('invalid number');
    i += m![0].length;
  };
  const value = (depth: number): void => {
    if (depth > 1000) fail('nesting too deep');
    ws();
    const c = s[i];
    if (c === '{') {
      i++;
      ws();
      if (s[i] === '}') {
        i++;
        return;
      }
      for (;;) {
        ws();
        if (s[i] !== '"') fail(s[i] === "'" ? 'keys must use double quotes' : s[i] === '}' ? 'trailing comma before }' : 'expected a quoted property name');
        str();
        ws();
        if (s[i] !== ':') fail('expected “:” after the property name');
        i++;
        value(depth + 1);
        ws();
        if (s[i] === ',') {
          i++;
          continue;
        }
        if (s[i] === '}') {
          i++;
          return;
        }
        fail('expected “,” or “}”');
      }
    }
    if (c === '[') {
      i++;
      ws();
      if (s[i] === ']') {
        i++;
        return;
      }
      for (;;) {
        ws();
        if (s[i] === ']') fail('trailing comma before ]');
        value(depth + 1);
        ws();
        if (s[i] === ',') {
          i++;
          continue;
        }
        if (s[i] === ']') {
          i++;
          return;
        }
        fail('expected “,” or “]”');
      }
    }
    if (c === '"') return str();
    if (c === "'") fail('strings must use double quotes');
    if (c === '-' || (c !== undefined && c >= '0' && c <= '9')) return num();
    for (const lit of ['true', 'false', 'null']) if (s.startsWith(lit, i)) return void (i += lit.length);
    if (c === undefined) fail('unexpected end of input');
    if (c === '/' && (s[i + 1] === '/' || s[i + 1] === '*')) fail('comments are not allowed in JSON');
    fail(`unexpected character “${c}”`);
  };
  try {
    value(0);
    ws();
    if (i < s.length) fail('unexpected content after the JSON value');
    return null;
  } catch (e) {
    if (e && typeof e === 'object' && 'pos' in e) return e as { pos: number; reason: string };
    throw e;
  }
}

/** JSON.parse with consistent, readable errors (line/column) and a JSON Lines fallback. */
export function parseJson(text: string, opts: { allowJsonLines?: boolean } = {}): { value: unknown; warnings: ConversionIssue[] } {
  const input = text.replace(/^﻿/, '').trim();
  if (!input) throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  try {
    return { value: JSON.parse(input) as unknown, warnings: [] };
  } catch (err) {
    if (opts.allowJsonLines !== false) {
      const lines = input.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length > 1) {
        try {
          const values = lines.map((l) => JSON.parse(l) as unknown);
          return { value: values, warnings: [warning(`Read as JSON Lines: ${lines.length} records, one per line.`)] };
        } catch {
          /* fall through to the original error */
        }
      }
    }
    const located = locateJsonError(input);
    if (located) {
      const { line, col } = lineCol(input, located.pos);
      throw new ConversionError('MALFORMED_INPUT', `Invalid JSON at line ${line}, column ${col}: ${located.reason}.`);
    }
    throw new ConversionError('MALFORMED_INPUT', `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
}
