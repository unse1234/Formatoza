import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser';
import { ConversionError } from '../types';

export interface ParseXmlOptions {
  attributePrefix: string;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

export function parseXml(text: string, opts: ParseXmlOptions): unknown {
  const input = text.replace(/^﻿/, '').trim();
  if (!input) throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  if (/<!ENTITY/i.test(input))
    throw new ConversionError('MALFORMED_INPUT', 'XML with custom <!ENTITY> declarations is not supported (they can be used to create exponentially large documents).');
  const valid = XMLValidator.validate(input, { allowBooleanAttributes: true });
  if (valid !== true) {
    const { msg, line, col } = valid.err;
    throw new ConversionError('MALFORMED_INPUT', `Invalid XML at line ${line}, column ${col}: ${msg}`);
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
    htmlEntities: false,
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
  n = n.replace(/:/g, '_');
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
    return value.map((v) => (Array.isArray(v) ? { [itemName]: prepare(v, itemName, prefix) } : prepare(v, itemName, prefix)));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === '#text') out[k] = prepare(v, itemName, prefix);
    else if (prefix && k.startsWith(prefix) && k.length > prefix.length && (v === null || typeof v !== 'object'))
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
    tree = keys.length === 1 && isPlainObject(value[keys[0]!]) ? prepare(value, item, prefix) : { [root]: prepare(value, item, prefix) };
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
