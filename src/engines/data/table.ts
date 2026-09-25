/**
 * Table ⇄ tree mapping shared by all data conversions.
 */
import { ConversionError } from '../types';

export type Scalar = string | number | boolean | null;
export interface Table {
  columns: string[];
  rows: Scalar[][];
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && !(v instanceof Date);

/**
 * Lossless typing: a string becomes a number only if the number prints back
 * identically (so "007", "1.50", "+44", "1e3" and 20-digit IDs stay strings).
 */
export function typedValue(s: string, opts: { maxDigits?: number } = {}): Scalar {
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n) && String(n) === s) {
      if (opts.maxDigits && s.replace(/[-.]/g, '').length > opts.maxDigits) return s;
      return n;
    }
  }
  return s;
}

/** Makes header names unique and non-empty: "", "name", "name" → "column_1", "name", "name_2". */
export function normalizeHeaders(raw: string[]): string[] {
  const seen = new Map<string, number>();
  return raw.map((h, i) => {
    let name = h.trim() || `column_${i + 1}`;
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    if (count > 0) {
      let candidate = `${name}_${count + 1}`;
      while (seen.has(candidate)) candidate = `${candidate}_`;
      seen.set(candidate, 1);
      name = candidate;
    }
    return name;
  });
}

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function safeKey(k: string): string {
  return FORBIDDEN_KEYS.has(k) ? `${k}_` : k;
}

/** Sets a dotted path on a null-prototype-free plain object; returns false on conflict. */
function setPath(target: Record<string, unknown>, path: string[], value: unknown): boolean {
  let node: Record<string, unknown> = target;
  for (let i = 0; i < path.length - 1; i++) {
    const k = safeKey(path[i]!);
    const next = node[k];
    if (next === undefined) {
      const created: Record<string, unknown> = {};
      node[k] = created;
      node = created;
    } else if (isPlainObject(next)) node = next;
    else return false;
  }
  const last = safeKey(path.at(-1)!);
  if (last in node && isPlainObject(node[last])) return false;
  node[last] = value;
  return true;
}

export interface RecordOptions {
  typed: boolean;
  unflatten: boolean;
}

/** Table with header → array of objects. */
export function tableToRecords(table: Table, opts: RecordOptions): { records: Record<string, unknown>[]; conflicts: string[] } {
  const conflicts = new Set<string>();
  const records = table.rows.map((row) => {
    const obj: Record<string, unknown> = {};
    table.columns.forEach((col, i) => {
      const raw = row[i] ?? '';
      const value = opts.typed && typeof raw === 'string' ? typedValue(raw) : raw;
      if (opts.unflatten && col.includes('.') && !col.startsWith('.') && !col.endsWith('.')) {
        if (!setPath(obj, col.split('.'), value)) {
          conflicts.add(col);
          obj[safeKey(col)] = value;
        }
      } else if (opts.unflatten) {
        if (!setPath(obj, [col], value)) {
          conflicts.add(col);
          obj[`${safeKey(col)}_value`] = value;
        }
      } else obj[safeKey(col)] = value;
    });
    return obj;
  });
  return { records, conflicts: [...conflicts] };
}

/** Table without header → array of arrays. */
export function tableToArrays(table: Table, typed: boolean): Scalar[][] {
  const all = [table.columns, ...table.rows];
  return all.map((r) => r.map((v) => (typed && typeof v === 'string' ? typedValue(v) : v)));
}

function flattenInto(out: Record<string, Scalar>, value: unknown, prefix: string, flatten: boolean): void {
  if (isPlainObject(value) && flatten) {
    const keys = Object.keys(value);
    if (keys.length === 0 && prefix) out[prefix] = '';
    for (const k of keys) flattenInto(out, value[k], prefix ? `${prefix}.${k}` : k, flatten);
    return;
  }
  const key = prefix || 'value';
  if (value === null || value === undefined) out[key] = null;
  else if (value instanceof Date) out[key] = value.toISOString();
  else if (typeof value === 'object') out[key] = JSON.stringify(value);
  else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') out[key] = value;
  else out[key] = String(value);
}

/**
 * Finds the array of records in a parsed tree: the top-level array, or the
 * largest array of objects within a few levels (e.g. `{ data: [...] }`,
 * `<catalog><book/><book/></catalog>`).
 */
export function findRecords(value: unknown): { records: unknown[]; path: string } {
  if (Array.isArray(value)) return { records: value, path: '' };
  let best: { records: unknown[]; path: string } | undefined;
  const queue: { v: unknown; path: string; depth: number }[] = [{ v: value, path: '', depth: 0 }];
  while (queue.length) {
    const { v, path, depth } = queue.shift()!;
    if (Array.isArray(v)) {
      const objects = v.filter(isPlainObject).length;
      if (objects > 0 && (!best || v.length > best.records.length)) best = { records: v, path };
      continue;
    }
    if (isPlainObject(v) && depth < 6)
      for (const [k, child] of Object.entries(v)) queue.push({ v: child, path: path ? `${path}.${k}` : k, depth: depth + 1 });
  }
  if (best) return best;
  // No array anywhere: a single record. If the object is a single-key wrapper
  // around an object (e.g. an XML root element), unwrap it.
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 1 && isPlainObject(value[keys[0]!])) return { records: [value[keys[0]!]], path: keys[0]! };
    return { records: [value], path: '' };
  }
  return { records: [value], path: '' };
}

/** Tree → table: column union in first-seen order. Arrays of arrays are treated as raw rows. */
export function treeToTable(value: unknown, flatten: boolean): { table: Table; recordPath: string } {
  const { records, path } = findRecords(value);
  if (records.length === 0) throw new ConversionError('EMPTY_INPUT', 'The data contains an empty list — there are no records to convert.');
  if (records.every(Array.isArray)) {
    const rows = records as unknown[][];
    const width = Math.max(...rows.map((r) => r.length));
    const toScalar = (v: unknown): Scalar => {
      const o: Record<string, Scalar> = {};
      flattenInto(o, v, 'v', false);
      return o['v'] ?? null;
    };
    const [head = [], ...rest] = rows;
    const columns = normalizeHeaders(Array.from({ length: width }, (_, i) => String(head[i] ?? '')));
    return { table: { columns, rows: rest.map((r) => Array.from({ length: width }, (_, i) => toScalar(r[i]))) }, recordPath: path };
  }
  const flat = records.map((r) => {
    const o: Record<string, Scalar> = {};
    flattenInto(o, r, '', flatten);
    return o;
  });
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const o of flat)
    for (const k of Object.keys(o))
      if (!seen.has(k)) {
        seen.add(k);
        columns.push(k);
      }
  return { table: { columns, rows: flat.map((o) => columns.map((c) => (c in o ? o[c]! : null))) }, recordPath: path };
}

export function scalarToString(v: Scalar): string {
  if (v === null) return '';
  return typeof v === 'string' ? v : String(v);
}
