import type { FormatId } from '~/lib/catalog/types';
import { dedupeNames, outputFileName } from '~/lib/file/filename';
import { formatBytes } from '~/lib/file/format';
import { readText, textBlob } from '~/lib/file/text';
import { sniffBytes } from '~/lib/file/sniff';
import { getOptionFields, resolveOptions, type OptionValues } from '../options';
import { OUTPUT_TYPE, matchesFormat } from '../shared/extensions';
import { runPerFile, throwIfAborted, validateFiles, warning } from '../shared/engine-utils';
import { parseJson } from '../shared/json';
import { ConversionError, type ConversionIssue, type ConverterEngine, type OutputFile } from '../types';
import { bytesAsText, decodeBase64, encodeBase64, urlDecode, urlEncode } from './encoding';

const SOURCES: FormatId[] = ['markdown', 'html', 'txt', 'base64', 'json', 'urlencoded'];
const TARGETS: FormatId[] = ['html', 'markdown', 'txt', 'base64', 'json', 'urlencoded'];

const SNIFF_EXT: Record<string, { ext: string; mime: string; label: string }> = {
  jpg: { ext: '.jpg', mime: 'image/jpeg', label: 'a JPEG image' },
  png: { ext: '.png', mime: 'image/png', label: 'a PNG image' },
  gif: { ext: '.gif', mime: 'image/gif', label: 'a GIF image' },
  webp: { ext: '.webp', mime: 'image/webp', label: 'a WebP image' },
  pdf: { ext: '.pdf', mime: 'application/pdf', label: 'a PDF document' },
  zip: { ext: '.zip', mime: 'application/zip', label: 'a ZIP archive (or DOCX/XLSX)' },
  bmp: { ext: '.bmp', mime: 'image/bmp', label: 'a BMP image' },
  ico: { ext: '.ico', mime: 'image/x-icon', label: 'an icon' },
  tiff: { ext: '.tiff', mime: 'image/tiff', label: 'a TIFF image' },
  avif: { ext: '.avif', mime: 'image/avif', label: 'an AVIF image' },
  heic: { ext: '.heic', mime: 'image/heic', label: 'a HEIC image' },
};

const JWT = /^[A-Za-z0-9_-]{2,}\.[A-Za-z0-9_-]{2,}\.[A-Za-z0-9_-]*$/;

function textOut(sourceName: string, to: FormatId, body: string, details?: Record<string, string>): OutputFile {
  const out = OUTPUT_TYPE[to];
  return { name: outputFileName(sourceName, out.ext), mimeType: out.mime, blob: textBlob(body, out.mime), sourceName, ...(details ? { details } : {}) };
}

async function convertOne(file: File, from: FormatId, to: FormatId, o: OptionValues): Promise<{ outputs: OutputFile[]; warnings: ConversionIssue[] }> {
  const warnings: ConversionIssue[] = [];
  const { text, encoding } = await readText(file);
  if (encoding === 'windows-1252' && from !== 'base64' && from !== 'urlencoded')
    warnings.push(warning('The file was not valid UTF-8 and was read as Windows-1252. The output is UTF-8.'));
  if (!text.trim() && from !== 'txt') throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  if (!text && from === 'txt') throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  const key = `${from}>${to}`;

  switch (key) {
    case 'markdown>html': {
      const { markdownToHtml } = await import('./markdown');
      return { outputs: [textOut(file.name, to, markdownToHtml(text, { gfm: o['gfm'] !== false, breaks: o['breaks'] === true, fullDocument: o['fullDocument'] === true }))], warnings };
    }
    case 'markdown>txt': {
      const { markdownToText } = await import('./markdown');
      return { outputs: [textOut(file.name, to, markdownToText(text, { keepLinks: o['keepLinks'] === true }))], warnings };
    }
    case 'html>markdown':
    case 'html>txt': {
      if (typeof DOMParser === 'undefined') throw new ConversionError('BROWSER_UNSUPPORTED', 'This conversion needs a browser DOM.');
      const html = await import('./html');
      const body =
        key === 'html>txt'
          ? html.htmlToText(text, { keepLinks: o['keepLinks'] === true, keepImagesAlt: o['keepImagesAlt'] === true })
          : html.htmlToMarkdown(text, { headingStyle: o['headingStyle'] === 'setext' ? 'setext' : 'atx', bullet: o['bullet'] === '*' ? '*' : '-' });
      if (!body.trim()) warnings.push(warning('The HTML contained no visible text.'));
      return { outputs: [textOut(file.name, to, body)], warnings };
    }
    case 'txt>base64': {
      const body = encodeBase64(text, { urlSafe: o['urlSafe'] === true, wrap: o['wrap'] === true });
      return { outputs: [textOut(file.name, to, body, { 'Input bytes': formatBytes(new TextEncoder().encode(text).length), 'Output chars': body.length.toLocaleString('en-US') })], warnings };
    }
    case 'json>base64': {
      const { value, warnings: jw } = parseJson(text, { allowJsonLines: false });
      warnings.push(...jw);
      const json = o['minify'] !== false ? JSON.stringify(value) : text.replace(/^﻿/, '').trim();
      return { outputs: [textOut(file.name, to, encodeBase64(json, { urlSafe: o['urlSafe'] === true, wrap: false }))], warnings };
    }
    case 'base64>json': {
      const trimmed = text.trim();
      const indentRaw = String(o['indent'] ?? '2');
      const indent = indentRaw === 'tab' ? '\t' : Number(indentRaw) || undefined;
      if (JWT.test(trimmed)) {
        const [h, p] = trimmed.split('.');
        const parse = (seg: string, label: string) => {
          const decoded = bytesAsText(decodeBase64(seg).bytes);
          if (decoded === null) throw new ConversionError('MALFORMED_INPUT', `The JWT ${label} is not text.`);
          return parseJson(decoded, { allowJsonLines: false }).value;
        };
        const value = { header: parse(h!, 'header'), payload: parse(p!, 'payload') };
        warnings.push(warning('This looks like a JSON Web Token: its header and payload were decoded. The signature was NOT verified.'));
        return { outputs: [textOut(file.name, to, `${JSON.stringify(value, null, indent)}\n`)], warnings };
      }
      const decoded = decodeBase64(trimmed);
      const asText = bytesAsText(decoded.bytes);
      if (asText === null) throw new ConversionError('MALFORMED_INPUT', 'The Base64 decodes to binary data, not JSON text. Try Base64 to Text to download it as a file.');
      const { value } = parseJson(asText, { allowJsonLines: false });
      if (decoded.paddingAdded) warnings.push(warning('Missing “=” padding was added automatically.'));
      return { outputs: [textOut(file.name, to, `${JSON.stringify(value, null, indent)}\n`)], warnings };
    }
    case 'base64>txt': {
      const decoded = decodeBase64(text);
      if (decoded.urlSafe) warnings.push(warning('URL-safe Base64 (- and _) was detected and decoded.'));
      if (decoded.paddingAdded) warnings.push(warning('Missing “=” padding was added automatically.'));
      const asText = bytesAsText(decoded.bytes);
      if (asText !== null) return { outputs: [textOut(file.name, 'txt', asText, { 'Decoded bytes': formatBytes(decoded.bytes.length) })], warnings };
      const kind = SNIFF_EXT[sniffBytes(decoded.bytes)];
      const ext = kind?.ext ?? '.bin';
      const mime = kind?.mime ?? decoded.dataUrlMime ?? 'application/octet-stream';
      warnings.push(warning(`This Base64 is not text — it decodes to ${kind?.label ?? 'binary data'} (${formatBytes(decoded.bytes.length)}). Download it as a file below.`));
      return {
        outputs: [{ name: outputFileName(file.name === 'pasted.txt' ? 'decoded' : file.name, ext), mimeType: mime, blob: new Blob([decoded.bytes as BlobPart], { type: mime }), sourceName: file.name }],
        warnings,
      };
    }
    case 'txt>urlencoded': {
      const mode = o['mode'] === 'uri' ? 'uri' : 'component';
      if (/%[0-9a-f]{2}/i.test(text)) warnings.push(warning('The input already contains percent-encoded sequences; encoding again turns % into %25. Use the URL Decoder first if this was not intended.'));
      return { outputs: [textOut(file.name, 'txt', urlEncode(text, { mode, spacePlus: o['spacePlus'] === true, perLine: o['perLine'] === true }))], warnings };
    }
    case 'urlencoded>txt': {
      const r = urlDecode(text, { plusAsSpace: o['plusAsSpace'] !== false, repeat: o['repeat'] === true });
      if (r.invalidSequences) warnings.push(warning(`${r.invalidSequences} sequence(s) were not valid UTF-8 and were decoded as Windows-1252.`));
      if (r.passes > 1) warnings.push(warning(`The text was encoded ${r.passes} times; it was decoded ${r.passes} times.`));
      if (o['repeat'] !== true && /%(25|2[0-9a-f]|3[a-f]|40|5[bd])/i.test(r.text))
        warnings.push(warning('The result still contains percent-encoded characters — the text may have been encoded twice. Turn on “Decode repeatedly”.'));
      return { outputs: [textOut(file.name, 'txt', r.text)], warnings };
    }
    default:
      throw new ConversionError('UNSUPPORTED_FORMAT', `${from} → ${to} is not supported.`);
  }
}

export const textEngine: ConverterEngine = {
  id: 'text',
  sourceFormats: SOURCES,
  targetFormats: TARGETS,
  supportsBatch: true,
  runsLocally: true,
  canProcess: (file, from) => matchesFormat(file, from),
  validate: (input, limits) => validateFiles(input, limits),
  async convert(input, rawOptions, ctx) {
    const o = resolveOptions(getOptionFields('text', input.from, input.to), rawOptions);
    const result = await runPerFile(input.files, ctx, async (file) => {
      throwIfAborted(ctx?.signal);
      return convertOne(file, input.from, input.to, o);
    });
    const names = dedupeNames(result.outputs.map((f) => f.name));
    result.outputs.forEach((f, i) => (f.name = names[i]!));
    return result;
  },
};
