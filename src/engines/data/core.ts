/**
 * Data conversions (CSV, TSV, JSON, XML, YAML → each other, and → XLSX).
 * Pure JS: runs in a Web Worker in the browser and directly in unit tests.
 */
import type { FormatId } from '~/lib/catalog/types';
import { outputFileName, dedupeNames, baseName } from '~/lib/file/filename';
import { readText, textBlob } from '~/lib/file/text';
import { getOptionFields, resolveOptions, type OptionValues } from '../options';
import { OUTPUT_TYPE, matchesFormat } from '../shared/extensions';
import { runPerFile, throwIfAborted, toIssue, validateFiles, warning } from '../shared/engine-utils';
import {
  ConversionError,
  type ConversionContext,
  type ConversionInput,
  type ConversionIssue,
  type ConversionLimits,
  type ConversionResult,
  type ConverterEngine,
  type OutputFile,
} from '../types';
import { delimiterName, parseDelimited, writeDelimited } from './delimited';
import { tableToArrays, tableToRecords, treeToTable, typedValue, type Scalar, type Table } from './table';
import { buildXml, parseXml } from './xml';
import { parseJson } from '../shared/json';
import { parseYaml, stringifyYaml } from './yaml';
import { writeXlsx, type Sheet } from './xlsx';

type Parsed = { kind: 'table'; table: Table } | { kind: 'tree'; value: unknown };

const TABLE_FORMATS: FormatId[] = ['csv', 'tsv'];

function parse(text: string, from: FormatId, o: OptionValues): { parsed: Parsed; warnings: ConversionIssue[] } {
  switch (from) {
    case 'csv':
    case 'tsv': {
      const delimiter = from === 'tsv' ? '\t' : String(o['delimiter'] ?? 'auto');
      const r = parseDelimited(text, { delimiter, header: o['header'] !== false });
      const warnings = [...r.warnings];
      if (from === 'csv' && delimiter === 'auto' && r.delimiter !== ',')
        warnings.push(warning(`Detected ${delimiterName(r.delimiter)} as the separator.`));
      return { parsed: { kind: 'table', table: r.table }, warnings };
    }
    case 'json': {
      const r = parseJson(text);
      return { parsed: { kind: 'tree', value: r.value }, warnings: r.warnings };
    }
    case 'yaml': {
      const r = parseYaml(text);
      return { parsed: { kind: 'tree', value: r.value }, warnings: r.warnings };
    }
    case 'xml':
      return { parsed: { kind: 'tree', value: parseXml(text, { attributePrefix: String(o['attributePrefix'] ?? '@') }) }, warnings: [] };
    default:
      throw new ConversionError('UNSUPPORTED_FORMAT', `Cannot read ${from}.`);
  }
}

function indentValue(o: OptionValues): string | number {
  const v = String(o['indent'] ?? '2');
  return v === 'tab' ? '\t' : Number(v);
}

/** Tree view of parsed input (for JSON/YAML/XML output). */
function asTree(parsed: Parsed, o: OptionValues, warnings: ConversionIssue[]): unknown {
  if (parsed.kind === 'tree') return parsed.value;
  const typed = o['typed'] !== false;
  if (o['header'] === false) return tableToArrays(parsed.table, typed);
  const { records, conflicts } = tableToRecords(parsed.table, { typed, unflatten: o['unflatten'] === true });
  if (conflicts.length)
    warnings.push(warning(`Column${conflicts.length > 1 ? 's' : ''} ${conflicts.slice(0, 5).join(', ')} clashed with a nested path and were kept as separate keys.`));
  return records;
}

/** Table view of parsed input (for CSV/TSV/XLSX output). */
function asTable(parsed: Parsed, o: OptionValues, warnings: ConversionIssue[]): { table: Table; header: boolean } {
  if (parsed.kind === 'table') return { table: parsed.table, header: o['header'] !== false };
  const { table, recordPath } = treeToTable(parsed.value, o['flatten'] !== false);
  if (recordPath) warnings.push(warning(`Used the ${table.rows.length} records found at “${recordPath}” as rows.`));
  return { table, header: true };
}

function serialize(parsed: Parsed, to: FormatId, o: OptionValues, warnings: ConversionIssue[]): string {
  switch (to) {
    case 'csv':
    case 'tsv': {
      const { table, header } = asTable(parsed, o, warnings);
      return writeDelimited(table, {
        delimiter: to === 'tsv' ? '\t' : String(o['outDelimiter'] ?? ','),
        header,
        escapeFormulas: o['escapeFormulas'] === true,
      });
    }
    case 'json': {
      const tree = asTree(parsed, o, warnings);
      const indent = indentValue(o);
      return `${JSON.stringify(tree, null, indent === 0 ? undefined : indent)}\n`;
    }
    case 'yaml':
      return stringifyYaml(asTree(parsed, o, warnings), Number(o['indent'] ?? 2) || 2);
    case 'xml':
      return buildXml(asTree(parsed, o, warnings), {
        rootName: String(o['rootName'] ?? 'root'),
        itemName: String(o['itemName'] ?? 'item'),
        indent: Number(o['indent'] ?? 2),
        attributePrefix: String(o['attributePrefix'] ?? '@') || '@',
        declaration: true,
      });
    default:
      throw new ConversionError('UNSUPPORTED_FORMAT', `Cannot write ${to}.`);
  }
}

function tableToSheetRows(table: Table, header: boolean, typed: boolean): Scalar[][] {
  const convert = (v: Scalar): Scalar => (typed && typeof v === 'string' ? typedValue(v, { maxDigits: 15 }) : v);
  const body = table.rows.map((r) => r.map(convert));
  return header ? [table.columns, ...body] : body;
}

async function toXlsx(input: ConversionInput, o: OptionValues, ctx?: ConversionContext): Promise<ConversionResult> {
  const sheets: { sheet: Sheet; file: File }[] = [];
  const errors: ConversionIssue[] = [];
  const warnings: ConversionIssue[] = [];
  for (const [i, file] of input.files.entries()) {
    throwIfAborted(ctx?.signal);
    ctx?.onProgress?.({ fraction: i / input.files.length });
    try {
      const { text } = await readText(file);
      const w: ConversionIssue[] = [];
      const { parsed, warnings: pw } = parse(text, input.from, o);
      w.push(...pw);
      const { table, header } = asTable(parsed, o, w);
      const typed = parsed.kind === 'tree' || o['typed'] !== false;
      sheets.push({ sheet: { name: baseName(file.name), rows: tableToSheetRows(table, header, typed), styleHeader: header && o['styleHeader'] !== false }, file });
      warnings.push(...w.map((x) => ({ ...x, file: file.name })));
    } catch (err) {
      errors.push(toIssue(err, file.name));
    }
  }
  const outputs: OutputFile[] = [];
  const groups = o['combine'] === 'files' || sheets.length === 1 ? sheets.map((s) => [s]) : sheets.length ? [sheets] : [];
  for (const group of groups) {
    try {
      const { bytes, truncatedCells } = writeXlsx(group.map((g) => g.sheet));
      if (truncatedCells) warnings.push(warning(`${truncatedCells} cell(s) exceeded Excel's 32,767-character limit and were truncated.`));
      const name = group.length === 1 ? outputFileName(group[0]!.file.name, '.xlsx') : 'combined.xlsx';
      const rows = group.reduce((n, g) => n + g.sheet.rows.length, 0);
      outputs.push({
        name,
        mimeType: OUTPUT_TYPE.xlsx.mime,
        blob: new Blob([bytes as BlobPart], { type: OUTPUT_TYPE.xlsx.mime }),
        ...(group.length === 1 ? { sourceName: group[0]!.file.name } : {}),
        details: { Sheets: String(group.length), Rows: rows.toLocaleString('en-US') },
      });
    } catch (err) {
      errors.push(toIssue(err, group.length === 1 ? group[0]!.file.name : undefined));
    }
  }
  ctx?.onProgress?.({ fraction: 1 });
  return { outputs, errors, warnings };
}

export const SOURCE_FORMATS: FormatId[] = ['csv', 'tsv', 'json', 'xml', 'yaml'];
export const TARGET_FORMATS: FormatId[] = ['csv', 'tsv', 'json', 'xml', 'yaml', 'xlsx'];

export const dataEngineCore: ConverterEngine = {
  id: 'data',
  sourceFormats: SOURCE_FORMATS,
  targetFormats: TARGET_FORMATS,
  supportsBatch: true,
  runsLocally: true,
  canProcess: (file, from) => matchesFormat(file, from),
  validate: (input: ConversionInput, limits: ConversionLimits) => validateFiles(input, limits),

  async convert(input, rawOptions, ctx) {
    const o = resolveOptions(getOptionFields('data', input.from, input.to), rawOptions);
    if (!SOURCE_FORMATS.includes(input.from) || !TARGET_FORMATS.includes(input.to) || input.from === input.to)
      throw new ConversionError('UNSUPPORTED_FORMAT', `${input.from} → ${input.to} is not supported.`);
    if (input.to === 'xlsx') return toXlsx(input, o, ctx);
    const out = OUTPUT_TYPE[input.to];
    const result = await runPerFile(input.files, ctx, async (file) => {
      const { text } = await readText(file);
      throwIfAborted(ctx?.signal);
      const warnings: ConversionIssue[] = [];
      const { parsed, warnings: pw } = parse(text, input.from, o);
      warnings.push(...pw);
      const body = serialize(parsed, input.to, o, warnings);
      const rows = parsed.kind === 'table' ? parsed.table.rows.length : undefined;
      return {
        outputs: [
          {
            name: outputFileName(file.name, out.ext),
            mimeType: out.mime,
            blob: textBlob(body, out.mime, input.to === 'csv' && o['bom'] === true),
            sourceName: file.name,
            ...(rows !== undefined && !TABLE_FORMATS.includes(input.to) ? { details: { Records: rows.toLocaleString('en-US') } } : {}),
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
