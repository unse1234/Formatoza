/**
 * DOCX → HTML / plain text via Mammoth (lazy-loaded). Output HTML is always
 * sanitised: Mammoth does not sanitise documents itself.
 */
import type { FormatId } from '~/lib/catalog/types';
import { baseName, dedupeNames, outputFileName } from '~/lib/file/filename';
import { textBlob } from '~/lib/file/text';
import { sniffBytes } from '~/lib/file/sniff';
import { getOptionFields, resolveOptions } from '../options';
import { OUTPUT_TYPE, matchesFormat } from '../shared/extensions';
import { runPerFile, throwIfAborted, validateFiles, warning } from '../shared/engine-utils';
import { ConversionError, type ConversionIssue, type ConverterEngine } from '../types';

const SOURCES: FormatId[] = ['docx'];
const TARGETS: FormatId[] = ['html', 'txt'];

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function wrapHtmlDocument(body: string, title: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#171717}
table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:.35rem .6rem;vertical-align:top}img{max-width:100%;height:auto}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

function summarizeMessages(messages: { type: string; message: string }[]): ConversionIssue[] {
  const styles = new Set<string>();
  const other = new Set<string>();
  for (const m of messages) {
    const s = /Unrecognised (?:paragraph|run) style: '([^']+)'/.exec(m.message);
    if (s) styles.add(s[1]!);
    else other.add(m.message.split('\n')[0]!.slice(0, 160));
  }
  const out: ConversionIssue[] = [];
  if (styles.size)
    out.push(warning(`${styles.size} custom Word style(s) had no HTML equivalent and were converted as plain paragraphs: ${[...styles].slice(0, 6).join(', ')}${styles.size > 6 ? '…' : ''}.`));
  for (const m of [...other].slice(0, 5)) out.push(warning(m));
  return out;
}

export const documentEngine: ConverterEngine = {
  id: 'document',
  sourceFormats: SOURCES,
  targetFormats: TARGETS,
  supportsBatch: true,
  runsLocally: true,
  canProcess: (file, from) => matchesFormat(file, from),
  validate: (input, limits) => validateFiles(input, limits),

  async convert(input, rawOptions, ctx) {
    if (input.from !== 'docx' || !TARGETS.includes(input.to)) throw new ConversionError('UNSUPPORTED_FORMAT', `${input.from} → ${input.to} is not supported.`);
    const o = resolveOptions(getOptionFields('document', input.from, input.to), rawOptions);
    const { default: mammoth } = await import('mammoth/mammoth.browser.min.js');
    const out = OUTPUT_TYPE[input.to];
    const result = await runPerFile(input.files, ctx, async (file) => {
      const buf = await file.arrayBuffer();
      const head = new Uint8Array(buf.slice(0, 8));
      if (head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0)
        throw new ConversionError('UNSUPPORTED_FORMAT', 'This is a legacy Word 97–2003 .doc file. Open it in Word, Google Docs or LibreOffice and save it as .docx first.');
      if (sniffBytes(head) !== 'zip') throw new ConversionError('MALFORMED_INPUT', 'This is not a valid .docx file (a DOCX is a ZIP package).');
      throwIfAborted(ctx?.signal);
      let res;
      try {
        res = input.to === 'txt' ? await mammoth.extractRawText({ arrayBuffer: buf }) : await mammoth.convertToHtml({ arrayBuffer: buf }, { ignoreEmptyParagraphs: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (/word\/document\.xml|Could not find/i.test(msg))
          throw new ConversionError('MALFORMED_INPUT', 'This ZIP file is not a Word document (it has no word/document.xml).');
        throw new ConversionError('MALFORMED_INPUT', `The document could not be read: ${msg.slice(0, 200)}`);
      }
      throwIfAborted(ctx?.signal);
      const warnings = summarizeMessages(res.messages);
      let body: string;
      if (input.to === 'txt') {
        body = `${res.value.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
      } else {
        const { sanitizeHtml } = await import('~/lib/security/sanitize');
        const allowImages = o['images'] !== 'omit';
        const clean = sanitizeHtml(res.value, { allowImages });
        if (clean.length < res.value.length * 0.98 && /<script|javascript:|on\w+=/i.test(res.value))
          warnings.push(warning('Potentially unsafe content (scripts or script links) was removed from the output.'));
        const pretty = clean.replace(/(<\/(p|h[1-6]|ul|ol|li|table|tr|blockquote)>)/g, '$1\n');
        body = o['fullDocument'] !== false ? wrapHtmlDocument(pretty.trim(), baseName(file.name)) : `${pretty.trim()}\n`;
      }
      if (!body.trim()) warnings.push(warning('The document contains no text.'));
      return {
        outputs: [{ name: outputFileName(file.name, out.ext), mimeType: out.mime, blob: textBlob(body, out.mime), sourceName: file.name }],
        warnings,
      };
    });
    const names = dedupeNames(result.outputs.map((f) => f.name));
    result.outputs.forEach((f, i) => (f.name = names[i]!));
    return result;
  },
};
