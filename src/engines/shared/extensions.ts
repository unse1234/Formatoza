/**
 * Compact extension/MIME table for engine code (kept separate from the prose
 * in supported-formats.json so engine chunks stay small). A unit test keeps the
 * two in sync.
 */
import type { FormatId } from '~/lib/catalog/types';

export const FORMAT_EXTENSIONS: Record<FormatId, { ext: string[]; mime: string[] }> = {
  heic: { ext: ['.heic', '.heif'], mime: ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'] },
  avif: { ext: ['.avif'], mime: ['image/avif'] },
  webp: { ext: ['.webp'], mime: ['image/webp'] },
  jpg: { ext: ['.jpg', '.jpeg', '.jfif', '.jpe'], mime: ['image/jpeg'] },
  png: { ext: ['.png'], mime: ['image/png'] },
  svg: { ext: ['.svg'], mime: ['image/svg+xml'] },
  gif: { ext: ['.gif'], mime: ['image/gif'] },
  bmp: { ext: ['.bmp', '.dib'], mime: ['image/bmp', 'image/x-ms-bmp'] },
  tiff: { ext: ['.tif', '.tiff'], mime: ['image/tiff'] },
  ico: { ext: ['.ico'], mime: ['image/x-icon', 'image/vnd.microsoft.icon'] },
  pdf: { ext: ['.pdf'], mime: ['application/pdf'] },
  docx: { ext: ['.docx'], mime: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] },
  csv: { ext: ['.csv'], mime: ['text/csv'] },
  tsv: { ext: ['.tsv', '.tab'], mime: ['text/tab-separated-values'] },
  json: { ext: ['.json'], mime: ['application/json'] },
  xml: { ext: ['.xml'], mime: ['application/xml', 'text/xml'] },
  yaml: { ext: ['.yaml', '.yml'], mime: ['application/yaml', 'text/yaml'] },
  xlsx: { ext: ['.xlsx'], mime: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] },
  markdown: { ext: ['.md', '.markdown', '.mdown', '.mkd'], mime: ['text/markdown'] },
  html: { ext: ['.html', '.htm', '.xhtml'], mime: ['text/html'] },
  txt: { ext: ['.txt', '.text'], mime: ['text/plain'] },
  base64: { ext: ['.b64', '.txt'], mime: ['text/plain'] },
  urlencoded: { ext: ['.txt'], mime: ['text/plain'] },
  srt: { ext: ['.srt'], mime: ['application/x-subrip', 'text/plain'] },
  vtt: { ext: ['.vtt'], mime: ['text/vtt'] },
  ass: { ext: ['.ass', '.ssa'], mime: ['text/x-ssa', 'text/plain'] },
};

/** Canonical output extension/MIME per target format. */
export const OUTPUT_TYPE: Record<FormatId, { ext: string; mime: string }> = {
  heic: { ext: '.heic', mime: 'image/heic' },
  avif: { ext: '.avif', mime: 'image/avif' },
  webp: { ext: '.webp', mime: 'image/webp' },
  jpg: { ext: '.jpg', mime: 'image/jpeg' },
  png: { ext: '.png', mime: 'image/png' },
  svg: { ext: '.svg', mime: 'image/svg+xml' },
  gif: { ext: '.gif', mime: 'image/gif' },
  bmp: { ext: '.bmp', mime: 'image/bmp' },
  tiff: { ext: '.tiff', mime: 'image/tiff' },
  ico: { ext: '.ico', mime: 'image/x-icon' },
  pdf: { ext: '.pdf', mime: 'application/pdf' },
  docx: { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  csv: { ext: '.csv', mime: 'text/csv' },
  tsv: { ext: '.tsv', mime: 'text/tab-separated-values' },
  json: { ext: '.json', mime: 'application/json' },
  xml: { ext: '.xml', mime: 'application/xml' },
  yaml: { ext: '.yaml', mime: 'application/yaml' },
  xlsx: { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  markdown: { ext: '.md', mime: 'text/markdown' },
  html: { ext: '.html', mime: 'text/html' },
  txt: { ext: '.txt', mime: 'text/plain' },
  base64: { ext: '.txt', mime: 'text/plain' },
  urlencoded: { ext: '.txt', mime: 'text/plain' },
  srt: { ext: '.srt', mime: 'application/x-subrip' },
  vtt: { ext: '.vtt', mime: 'text/vtt' },
  ass: { ext: '.ass', mime: 'text/x-ssa' },
};

const TEXT_FALLBACK: FormatId[] = ['base64', 'urlencoded', 'txt', 'tsv', 'json', 'csv', 'xml', 'yaml', 'markdown', 'html', 'srt', 'vtt', 'ass', 'svg'];

export function matchesFormat(file: { name: string; type: string }, format: FormatId): boolean {
  const name = file.name.toLowerCase();
  const { ext, mime } = FORMAT_EXTENSIONS[format];
  if (ext.some((e) => name.endsWith(e))) return true;
  if (file.type && mime.includes(file.type.toLowerCase())) return true;
  // Pasted text and extensionless text files are accepted for text-based formats;
  // the parser gives a precise error if the content is wrong.
  if (TEXT_FALLBACK.includes(format) && (!/\.[a-z0-9]{1,6}$/.test(name) || name.endsWith('.txt'))) return true;
  return false;
}
