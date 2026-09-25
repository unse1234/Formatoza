/**
 * End-to-end: every converter page converts a real fixture in Chromium and
 * produces a valid output — with no console errors and no uploads.
 */
import { expect, test } from '@playwright/test';
import {
  CONVERSIONS,
  downloadedOutputs,
  fixturePath,
  magic,
  watchConsole,
  watchNetwork,
} from './helpers';

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

interface Expectation {
  files: string[];
  outputs: number;
  kind: string;
  contains?: string | undefined;
}

function plan(c: { slug: string; from: string; to: string; engine: string }): Expectation {
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

for (const c of CONVERSIONS) {
  test(`${c.slug} converts a real file`, async ({ page, baseURL }) => {
    const problems = watchConsole(page);
    const requests = watchNetwork(page);
    const p = plan(c);
    await page.goto(`/${c.slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(c.h1);
    await expect(page.getByTestId('converter')).toBeVisible();

    let files = p.files.map(fixturePath);
    if (c.slug === 'base64-to-json') {
      // Build a Base64 JSON input on the fly.
      const { writeFileSync } = await import('node:fs');
      const path = test.info().outputPath('json.b64.txt');
      writeFileSync(path, Buffer.from('"Hello, wörld! 👋\\n"').toString('base64'));
      files = [path];
    }
    const before = requests.length;
    await page.locator('input[type="file"]').setInputFiles(files);
    await expect(page.getByTestId('file-item')).toHaveCount(files.length);
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('results')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('error')).toHaveCount(0);

    const outputs = await downloadedOutputs(page);
    expect(outputs, JSON.stringify(outputs.map((o) => o.name))).toHaveLength(p.outputs);
    for (const o of outputs) {
      expect(o.size).toBeGreaterThan(0);
      expect(magic(o.bytes), o.name).toBe(
        p.kind === 'jpg' ||
          p.kind === 'png' ||
          p.kind === 'webp' ||
          p.kind === 'pdf' ||
          p.kind === 'zip'
          ? p.kind
          : 'text',
      );
    }
    if (p.contains) expect(outputs[0]!.text).toContain(p.contains);

    // Privacy: conversion caused no uploads and no third-party requests.
    const origin = new URL(baseURL!).origin;
    const during = requests.slice(before);
    for (const r of during) {
      expect(['GET', 'HEAD'], `${r.method()} ${r.url()}`).toContain(r.method());
      const u = r.url();
      expect(u.startsWith(origin) || u.startsWith('blob:') || u.startsWith('data:'), u).toBe(true);
    }
    expect(problems).toEqual([]);
  });
}
