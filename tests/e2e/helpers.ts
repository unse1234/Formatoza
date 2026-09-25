import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page, Request } from '@playwright/test';

export interface CatalogEntry {
  slug: string;
  from: string;
  to: string;
  engine: string;
  category: string;
  h1: string;
  title: string;
}

export const ROOT = process.cwd();
export const CONVERSIONS: CatalogEntry[] = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'conversions.json'), 'utf8'),
);
export const FIXTURE_DIR = join(ROOT, 'tests', 'fixtures', 'input');
export const fixturePath = (name: string) => join(FIXTURE_DIR, name);

/** Collects console errors/warnings and uncaught exceptions. */
export function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

/** Records every network request so tests can prove nothing is uploaded. */
export function watchNetwork(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (r) => requests.push(r));
  return requests;
}

/** Reads the bytes behind each result's download link (blob: URLs) inside the page. */
export async function downloadedOutputs(
  page: Page,
): Promise<{ name: string; bytes: number[]; text: string; size: number }[]> {
  return page.$$eval('[data-testid="download"]', async (links) =>
    Promise.all(
      (links as HTMLAnchorElement[]).map(async (a) => {
        const buf = new Uint8Array(await (await fetch(a.href)).arrayBuffer());
        return {
          name: a.download,
          bytes: Array.from(buf.slice(0, 16)),
          text: new TextDecoder().decode(buf.slice(0, 200_000)),
          size: buf.length,
        };
      }),
    ),
  );
}

export function magic(bytes: number[]): string {
  const s = String.fromCharCode(...bytes);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
  if (bytes[0] === 0x89 && s.slice(1, 4) === 'PNG') return 'png';
  if (s.startsWith('RIFF') && s.slice(8, 12) === 'WEBP') return 'webp';
  if (s.startsWith('%PDF')) return 'pdf';
  if (s.startsWith('PK')) return 'zip';
  return 'text';
}

const IMAGE_FIXTURE: Record<string, string> = {
  heic: 'sample.heic',
  avif: 'sample.avif',
  webp: 'sample.webp',
  jpg: 'sample.jpg',
  png: 'sample.png',
  svg: 'sample.svg',
  gif: 'animated.gif',
  bmp: 'sample.bmp',
  tiff: 'multipage.tiff',
  ico: 'sample.ico',
};
const TEXT_FIXTURE: Record<string, string> = {
  csv: 'sample.csv',
  tsv: 'sample.tsv',
  json: 'sample.json',
  xml: 'sample.xml',
  yaml: 'sample.yaml',
  markdown: 'sample.md',
  html: 'sample.html',
  txt: 'plain.txt',
  base64: 'sample.base64.txt',
  urlencoded: 'sample.urlencoded.txt',
  srt: 'sample.srt',
  vtt: 'sample.vtt',
  ass: 'sample.ass',
  docx: 'sample.docx',
  pdf: 'sample.pdf',
};

export interface Expectation {
  files: string[];
  outputs: number;
  kind: string;
  contains?: string | undefined;
}

/** Which fixture(s) to feed a converter and what its output must look like. */
export function plan(c: { slug: string; from: string; to: string; engine: string }): Expectation {
  const imageTargets = ['jpg', 'png', 'webp'];
  if (c.engine === 'image')
    return { files: [IMAGE_FIXTURE[c.from]!], outputs: c.from === 'tiff' ? 2 : 1, kind: c.to };
  if (c.to === 'pdf')
    return {
      files: [IMAGE_FIXTURE[c.from]!, c.from === 'jpg' ? 'rotated.jpg' : IMAGE_FIXTURE[c.from]!],
      outputs: 1,
      kind: 'pdf',
    };
  if (c.from === 'pdf' && imageTargets.includes(c.to))
    return { files: ['sample.pdf'], outputs: 3, kind: c.to };
  if (c.slug === 'pdf-to-text')
    return {
      files: ['sample.pdf'],
      outputs: 1,
      kind: 'text',
      contains: 'Formatoza test document - page 2',
    };
  if (c.to === 'xlsx') return { files: ['sample.csv'], outputs: 1, kind: 'zip' };
  const contains: Record<string, string> = {
    'csv-to-json': '"zip": "01310-100"',
    'json-to-csv': 'address.city',
    'csv-to-tsv': 'Lee, Min-jun\t',
    'tsv-to-csv': '"Notebook, dotted"',
    'json-to-tsv': 'address.city\t',
    'tsv-to-json': '"stock": 240',
    'csv-to-xml': '<city>São Paulo</city>',
    'xml-to-csv': 'bk102',
    'json-to-xml': '<name>Lee Min-jun 👋</name>',
    'xml-to-json': '"@currency": "EUR"',
    'json-to-yaml': 'city: São Paulo',
    'yaml-to-json': '"queue": "orders"',
    'yaml-to-xml': '<replicas>3</replicas>',
    'xml-to-yaml': 'bk101',
    'markdown-to-html': '<table>',
    'html-to-markdown': '[changelog](https://example.com/changelog)',
    'html-to-text': 'Plan\tPrice',
    'markdown-to-text': 'Works offline',
    'text-to-base64': 'SGVsbG8s',
    'base64-to-text': 'Hello, wörld! 👋',
    'json-to-base64': 'W3siaWQiOjEs',
    'base64-to-json': '"Hello, wörld! 👋\\n"',
    'url-encode': 'Hello%2C%20w%C3%B6rld%21',
    'url-decode': 'https://example.com/search?q=café au lait&lang=fr',
    'srt-to-vtt': 'WEBVTT',
    'vtt-to-srt': '00:00:04,000 --> 00:00:06,250',
    'srt-to-ass': '[V4+ Styles]',
    'ass-to-srt': '<i>Previously, on the show…</i>',
    'srt-to-txt': 'We need to talk.',
    'vtt-to-txt': 'Rolling line three',
    'docx-to-html': '<h1>Quarterly report</h1>',
    'docx-to-txt': 'Two new markets',
  };
  // base64-to-json needs JSON inside the Base64: use the JSON fixture's Base64.
  return { files: [TEXT_FIXTURE[c.from]!], outputs: 1, kind: 'text', contains: contains[c.slug] };
}
