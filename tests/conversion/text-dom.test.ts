// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { textEngine as engine } from '~/engines/text';
import { htmlToText } from '~/engines/text/html';
import { fixture, golden, outputText, textFile } from './helpers';

const convert = (files: File[], from: string, to: string, options = {}) =>
  engine.convert({ files, from: from as never, to: to as never }, options);

describe('HTML → text', () => {
  it('keeps structure, drops scripts/styles/hidden, decodes entities (golden)', async () => {
    const txt = await outputText(await convert([fixture('sample.html')], 'html', 'txt'));
    await expect(txt).toMatchFileSnapshot(golden('html-to-text.txt'));
    expect(txt).not.toMatch(/alert|color:red|hidden text/);
    expect(txt).toContain('We rebuilt everything. Read the changelog & tell us.');
    expect(txt).toContain('- Faster pages');
    expect(txt).toContain('3. three');
    expect(txt).toContain('Plan\tPrice');
    expect(txt).toContain('line 1\n  line 2');
  });
  it('optionally keeps link URLs and alt text', () => {
    expect(
      htmlToText('<p><a href="https://e.com">site</a> <img alt="logo"></p>', {
        keepLinks: true,
        keepImagesAlt: true,
      }),
    ).toBe('site (https://e.com) [logo]\n');
  });
});

describe('HTML → Markdown', () => {
  it('converts headings, lists, links, tables and code (golden)', async () => {
    const md = await outputText(await convert([fixture('sample.html')], 'html', 'markdown'));
    await expect(md).toMatchFileSnapshot(golden('html-to-markdown.md'));
    expect(md).toContain('# Welcome to the _new_ site');
    expect(md).toContain('[changelog](https://example.com/changelog)');
    expect(md).toContain('| Plan | Price |');
    expect(md).not.toMatch(/alert\(1\)|color:red|hidden text/);
    expect(md).toContain('```\nline 1\n  line 2\n```');
  });
  it('supports setext headings and * bullets', async () => {
    const md = await outputText(
      await convert([textFile('<h1>T</h1><ul><li>a</li></ul>', 'x.html')], 'html', 'markdown', {
        headingStyle: 'setext',
        bullet: '*',
      }),
    );
    expect(md).toMatch(/^T\n=+\n\n\*\s+a\n$/);
  });
});
