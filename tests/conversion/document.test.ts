// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { documentEngine as engine } from '~/engines/document';
import { sanitizeHtml } from '~/lib/security/sanitize';
import { abortedSignal, fixture, golden, outputText } from './helpers';

const convert = (files: File[], to: string, options = {}, signal?: AbortSignal) =>
  engine.convert(
    { files, from: 'docx', to: to as never },
    options,
    signal ? { signal } : undefined,
  );

describe('DOCX → HTML', () => {
  it('maps structure to semantic HTML (golden)', async () => {
    const r = await convert([fixture('sample.docx')], 'html', { fullDocument: false });
    expect(r.errors).toEqual([]);
    const html = await outputText(r);
    await expect(html).toMatchFileSnapshot(golden('docx-to-html.html'));
    expect(html).toContain('<h1>Quarterly report</h1>');
    expect(html).toContain('<h2>Highlights</h2>');
    expect(html).toMatch(/<ul>\s*<li>Revenue up 12%<\/li>/);
    expect(html).toContain('<table>');
    expect(html).toContain('<a href="https://example.com/">link</a>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('東京, 👋');
    expect(html).toMatch(/<img[^>]+src="data:image\/png;base64,/);
  });
  it('can omit images and wrap a full document', async () => {
    const html = await outputText(
      await convert([fixture('sample.docx')], 'html', { images: 'omit', fullDocument: true }),
    );
    expect(html).not.toContain('<img');
    expect(html).toMatch(/^<!doctype html>[\s\S]*<title>sample<\/title>/);
  });
  it('sanitises dangerous content', () => {
    const dirty =
      '<p onclick="x()">a<a href="javascript:alert(1)">b</a><script>alert(2)</script><img src="data:image/png;base64,AAAA" onerror="y()"></p>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toMatch(/onclick|javascript:|<script|onerror/);
    expect(clean).toContain('data:image/png');
  });
});

describe('DOCX → TXT', () => {
  it('extracts text with paragraphs (golden)', async () => {
    const txt = await outputText(await convert([fixture('sample.docx')], 'txt'));
    await expect(txt).toMatchFileSnapshot(golden('docx-to-txt.txt'));
    expect(txt).toContain('Quarterly report\n\n');
    expect(txt).toContain('café, 東京, 👋');
  });
});

describe('errors', () => {
  it('explains legacy .doc files', async () => {
    const r = await convert([fixture('legacy.doc', 'legacy.docx')], 'html');
    expect(r.errors[0]!.message).toMatch(/Word 97–2003/);
  });
  it('rejects non-ZIP and non-Word ZIPs', async () => {
    expect((await convert([fixture('sample.csv', 'x.docx')], 'txt')).errors[0]!.code).toBe(
      'MALFORMED_INPUT',
    );
    expect((await convert([fixture('not-word.docx')], 'txt')).errors[0]!.message).toMatch(
      /not a Word document|could not be read/,
    );
  });
  it('converts several documents and honours cancellation', async () => {
    const r = await convert(
      [fixture('sample.docx', 'a.docx'), fixture('sample.docx', 'b.docx')],
      'txt',
    );
    expect(r.outputs.map((o) => o.name)).toEqual(['a.txt', 'b.txt']);
    await expect(
      convert([fixture('sample.docx')], 'txt', {}, abortedSignal()),
    ).rejects.toMatchObject({ code: 'ABORTED' });
  });
});
