import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';
import XMLBuilder from 'fast-xml-builder';
import { ConversionError } from '../types';

export interface ParseXmlOptions {
  attributePrefix: string;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export function parseXml(text: string, opts: ParseXmlOptions): unknown {
  const input = text.replace(/^\ufeff/, '').trim();
  if (!input) throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  if (/<!ENTITY/i.test(input))
    throw new ConversionError(
      'MALFORMED_INPUT',
      'XML with custom <!ENTITY> declarations is not supported (they can be used to create exponentially large documents).',
    );
  try {
    SyntaxValidator.validate(input, { allowBooleanAttributes: true });
  } catch (err) {
    const e = err as { message?: string; line?: number; col?: number };
    const where = e.line ? ` at line ${e.line}, column ${e.col ?? 0}` : '';
    throw new ConversionError(
      'MALFORMED_INPUT',
      `Invalid XML${where}: ${e.message ?? String(err)}`,
    );
  }
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: opts.attributePrefix,
    textNodeName: '#text',
    ignoreDeclaration: true,
    ignorePiTags: true,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
    allowBooleanAttributes: true,
    processEntities: true,
  });
  const out = parser.parse(input) as unknown;
  return sanitizeKeys(out);
}

/** Guards against `__proto__` style element names reaching object keys. */
function sanitizeKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sanitizeKeys);
  if (isPlainObject(v)) {
    const o: Record<string, unknown> = {};
    for (const [k, child] of Object.entries(v)) {
      const key = k === '__proto__' || k === 'constructor' || k === 'prototype' ? `${k}_` : k;
      o[key] = sanitizeKeys(child);
    }
    return o;
  }
  return v;
}

/** Converts an arbitrary key into a valid XML 1.0 element name. */
export function xmlName(key: string, fallback = 'item'): string {
  let n = key.normalize('NFC').replace(/[^\p{L}\p{N}_.\-:]/gu, '_');
  // Keep a single inner colon (namespace prefix, e.g. dc:title); any other colon becomes "_".
  const parts = n.split(':');
  n =
    parts.length === 2 && parts[0] && parts[1] && /^[\p{L}_]/u.test(parts[1])
      ? n
      : n.replace(/:/g, '_');
  if (!n) n = fallback;
  if (!/^[\p{L}_]/u.test(n)) n = `_${n}`;
  return n;
}

export interface BuildXmlOptions {
  rootName: string;
  itemName: string;
  indent: number;
  attributePrefix: string;
  declaration: boolean;
}

// XML 1.0 forbids most control characters even when escaped.
// eslint-disable-next-line no-control-regex
const INVALID_XML_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g;

function prepare(value: unknown, itemName: string, prefix: string): unknown {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value.replace(INVALID_XML_CHARS, '');
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    // Nested arrays have no element name of their own: wrap each in <item>.
    return value.map((v) =>
      Array.isArray(v)
        ? { [itemName]: prepare(v, itemName, prefix) }
        : prepare(v, itemName, prefix),
    );
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === '#text') out[k] = prepare(v, itemName, prefix);
    else if (
      prefix &&
      k.startsWith(prefix) &&
      k.length > prefix.length &&
      (v === null || typeof v !== 'object')
    )
      out[prefix + xmlName(k.slice(prefix.length))] = prepare(v, itemName, prefix);
    else out[xmlName(k, itemName)] = prepare(v, itemName, prefix);
  }
  return out;
}

export function buildXml(value: unknown, opts: BuildXmlOptions): string {
  const root = xmlName(opts.rootName || 'root', 'root');
  const item = xmlName(opts.itemName || 'item', 'item');
  const prefix = opts.attributePrefix || '@';
  let tree: unknown;
  if (Array.isArray(value)) tree = { [root]: { [item]: prepare(value, item, prefix) } };
  else if (isPlainObject(value)) {
    const keys = Object.keys(value);
    // A single top-level key holding an object is already a root element (e.g. from XML).
    tree =
      keys.length === 1 && isPlainObject(value[keys[0]!])
        ? prepare(value, item, prefix)
        : { [root]: prepare(value, item, prefix) };
  } else tree = { [root]: prepare(value, item, prefix) };

  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: prefix,
    textNodeName: '#text',
    format: opts.indent > 0,
    indentBy: ' '.repeat(Math.max(0, opts.indent)),
    suppressEmptyNode: true,
    processEntities: true,
  });
  const body = String(builder.build(tree)).trim();
  return `${opts.declaration ? '<?xml version="1.0" encoding="UTF-8"?>\n' : ''}${body}\n`;
}
