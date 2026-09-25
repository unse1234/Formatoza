/**
 * Minimal, dependency-light XLSX (SpreadsheetML) writer: shared strings,
 * numbers, booleans, a bold/frozen header row and column widths. Written by
 * hand on top of fflate's ZIP to avoid shipping a full spreadsheet library.
 */
import { strToU8, zipSync } from 'fflate';
import { ConversionError } from '../types';
import type { Scalar } from './table';

export const XLSX_MAX_ROWS = 1_048_576;
export const XLSX_MAX_COLS = 16_384;
export const XLSX_MAX_CELL_CHARS = 32_767;

export interface Sheet {
  name: string;
  rows: Scalar[][];
  styleHeader: boolean;
}

// eslint-disable-next-line no-control-regex
const INVALID_XML_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g;

function esc(s: string): string {
  return s
    .replace(INVALID_XML_CHARS, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function columnLetter(index: number): string {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Excel sheet names: ≤31 chars, no []:*?/\ , not blank, unique (case-insensitive). */
export function sheetNames(raw: string[]): string[] {
  const used = new Set<string>();
  return raw.map((r, i) => {
    let base = r
      .replace(/[[\]:*?/\\]/g, '_')
      .replace(/^'+|'+$/g, '')
      .trim();
    if (!base || base.toLowerCase() === 'history') base = `Sheet${i + 1}`;
    base = Array.from(base).slice(0, 31).join('');
    let name = base;
    let n = 2;
    while (used.has(name.toLowerCase())) {
      const suffix = ` (${n++})`;
      name =
        Array.from(base)
          .slice(0, 31 - suffix.length)
          .join('') + suffix;
    }
    used.add(name.toLowerCase());
    return name;
  });
}

export interface XlsxResult {
  bytes: Uint8Array;
  truncatedCells: number;
}

export function writeXlsx(sheets: Sheet[]): XlsxResult {
  if (sheets.length === 0) throw new ConversionError('EMPTY_INPUT', 'Nothing to write.');
  const names = sheetNames(sheets.map((s) => s.name));
  const shared = new Map<string, number>();
  const sharedList: string[] = [];
  let truncatedCells = 0;

  const sharedIndex = (s: string): number => {
    let v = s;
    if (Array.from(v).length > XLSX_MAX_CELL_CHARS) {
      v = Array.from(v).slice(0, XLSX_MAX_CELL_CHARS).join('');
      truncatedCells++;
    }
    let idx = shared.get(v);
    if (idx === undefined) {
      idx = sharedList.length;
      shared.set(v, idx);
      sharedList.push(v);
    }
    return idx;
  };

  const sheetXml = sheets.map((sheet) => {
    if (sheet.rows.length > XLSX_MAX_ROWS)
      throw new ConversionError(
        'LIMIT_EXCEEDED',
        `Excel worksheets hold at most ${XLSX_MAX_ROWS.toLocaleString('en-US')} rows; this data has ${sheet.rows.length.toLocaleString('en-US')}.`,
      );
    const width = Math.max(0, ...sheet.rows.map((r) => r.length));
    if (width > XLSX_MAX_COLS)
      throw new ConversionError(
        'LIMIT_EXCEEDED',
        `Excel worksheets hold at most ${XLSX_MAX_COLS.toLocaleString('en-US')} columns; this data has ${width.toLocaleString('en-US')}.`,
      );
    const widths = new Array<number>(width).fill(8);
    const rowsXml: string[] = [];
    sheet.rows.forEach((row, r) => {
      const cells: string[] = [];
      const style = r === 0 && sheet.styleHeader ? ' s="1"' : '';
      row.forEach((v, c) => {
        if (v === null || v === '') return;
        const ref = `${columnLetter(c)}${r + 1}`;
        const len = typeof v === 'string' ? Math.min(60, Array.from(v).length) : String(v).length;
        widths[c] = Math.max(widths[c]!, Math.min(60, len + 2));
        if (typeof v === 'number') cells.push(`<c r="${ref}"${style}><v>${v}</v></c>`);
        else if (typeof v === 'boolean')
          cells.push(`<c r="${ref}"${style} t="b"><v>${v ? 1 : 0}</v></c>`);
        else cells.push(`<c r="${ref}"${style} t="s"><v>${sharedIndex(v)}</v></c>`);
      });
      rowsXml.push(`<row r="${r + 1}">${cells.join('')}</row>`);
    });
    const cols = width
      ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
      : '';
    const pane =
      sheet.styleHeader && sheet.rows.length > 1
        ? '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'
        : '<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
    const dim =
      width && sheet.rows.length
        ? `<dimension ref="A1:${columnLetter(width - 1)}${sheet.rows.length}"/>`
        : '<dimension ref="A1"/>';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${dim}${pane}<sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${rowsXml.join('')}</sheetData><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>`;
  });

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
      .map(
        (_, i) =>
          `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
      )
      .join(
        '',
      )}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`),
    'docProps/core.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Formatoza</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</dcterms:created></cp:coreProperties>`),
    'docProps/app.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Formatoza</Application></Properties>`),
    'xl/workbook.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${names
      .map((n, i) => `<sheet name="${esc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
      .join('')}</sheets></workbook>`),
    'xl/_rels/workbook.xml.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map(
        (_, i) =>
          `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
      )
      .join(
        '',
      )}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId${sheets.length + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`),
    'xl/styles.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`),
  };
  sheetXml.forEach((xml, i) => (files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(xml)));
  files['xl/sharedStrings.xml'] = strToU8(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedList.length}" uniqueCount="${sharedList.length}">${sharedList
      .map((s) => `<si><t${/^\s|\s$|\n/.test(s) ? ' xml:space="preserve"' : ''}>${esc(s)}</t></si>`)
      .join('')}</sst>`,
  );
  return { bytes: zipSync(files, { level: 6 }), truncatedCells };
}
