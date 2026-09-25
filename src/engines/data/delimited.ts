import Papa from 'papaparse';
import { ConversionError, type ConversionIssue } from '../types';
import { warning } from '../shared/engine-utils';
import { normalizeHeaders, scalarToString, type Scalar, type Table } from './table';

export interface ParseDelimitedOptions {
  /** ',' ';' '|' '\t' or 'auto'. */
  delimiter: string;
  header: boolean;
}

export interface ParsedDelimited {
  table: Table;
  delimiter: string;
  warnings: ConversionIssue[];
}

const MAX_REPORTED_ROWS = 5;

function rowList(rows: number[]): string {
  const shown = rows.slice(0, MAX_REPORTED_ROWS).join(', ');
  return rows.length > MAX_REPORTED_ROWS ? `${shown} and ${rows.length - MAX_REPORTED_ROWS} more` : shown;
}

const DELIMITER_NAMES: Record<string, string> = { ',': 'comma', ';': 'semicolon', '\t': 'tab', '|': 'pipe' };

export function parseDelimited(text: string, opts: ParseDelimitedOptions): ParsedDelimited {
  const input = text.replace(/^﻿/, '');
  if (!input.trim()) throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  const res = Papa.parse<string[]>(input, {
    delimiter: opts.delimiter === 'auto' ? '' : opts.delimiter,
    delimitersToGuess: [',', ';', '\t', '|'],
    skipEmptyLines: 'greedy',
    header: false,
    dynamicTyping: false,
  });
  const warnings: ConversionIssue[] = [];
  const data = res.data;
  if (data.length === 0) throw new ConversionError('EMPTY_INPUT', 'No rows were found in the input.');

  const quoteErrors = res.errors.filter((e) => e.type === 'Quotes');
  if (quoteErrors.length) {
    const rows = [...new Set(quoteErrors.map((e) => (e.row ?? 0) + 1))];
    warnings.push(
      warning(`Unbalanced quotes near row ${rowList(rows)}. Everything after an unclosed quote is read as one field — check the result.`),
    );
  }
  if (opts.delimiter === 'auto' && res.meta.delimiter && data.some((r) => r.length > 1) === false && input.includes('\n'))
    warnings.push(warning('Only one column was found. If your data uses another separator, pick it under Settings → Input delimiter.'));

  const width = opts.header ? data[0]!.length : Math.max(...data.map((r) => r.length));
  const headerRow = opts.header ? data[0]! : Array.from({ length: width }, (_, i) => `column_${i + 1}`);
  const body = opts.header ? data.slice(1) : data;

  const short: number[] = [];
  const long: number[] = [];
  let maxLen = width;
  body.forEach((r, i) => {
    const lineNo = i + (opts.header ? 2 : 1);
    if (r.length < width) short.push(lineNo);
    if (r.length > width) {
      long.push(lineNo);
      maxLen = Math.max(maxLen, r.length);
    }
  });
  if (short.length) warnings.push(warning(`Row ${rowList(short)} had fewer fields than the header; missing values were left empty.`));
  if (long.length)
    warnings.push(warning(`Row ${rowList(long)} had more fields than the header; extra values were kept in added columns (column_${width + 1}…).`));

  const columns = normalizeHeaders([...headerRow, ...Array.from({ length: maxLen - width }, () => '')].map((h, i) => (i >= width ? `column_${i + 1}` : h)));
  const rows: Scalar[][] = body.map((r) => Array.from({ length: maxLen }, (_, i) => r[i] ?? ''));
  return { table: { columns, rows }, delimiter: res.meta.delimiter, warnings };
}

export interface WriteDelimitedOptions {
  delimiter: string;
  header: boolean;
  escapeFormulas: boolean;
}

const FORMULA_START = /^[=+\-@\t\r]/;
const NUMERIC = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

export function escapeFormula(v: string): string {
  return FORMULA_START.test(v) && !NUMERIC.test(v) ? `'${v}` : v;
}

export function writeDelimited(table: Table, opts: WriteDelimitedOptions): string {
  const cell = (v: Scalar) => {
    const s = scalarToString(v);
    return opts.escapeFormulas ? escapeFormula(s) : s;
  };
  const rows = table.rows.map((r) => r.map(cell));
  const data = opts.header ? [table.columns.map((c) => cell(c)), ...rows] : rows;
  return Papa.unparse(data, { delimiter: opts.delimiter, newline: '\r\n', quotes: false, escapeFormulae: false });
}

export function delimiterName(d: string): string {
  return DELIMITER_NAMES[d] ?? JSON.stringify(d);
}
