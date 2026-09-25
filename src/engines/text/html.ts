/**
 * HTML → plain text and HTML → Markdown. Requires a DOM (`DOMParser`), so these
 * run on the main thread in the browser (and under happy-dom in tests). Parsing
 * with DOMParser never executes scripts or loads resources.
 */
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const SKIP = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'TEMPLATE',
  'HEAD',
  'SVG',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'CANVAS',
  'SELECT',
  'DATALIST',
  'MATH',
]);
const BLOCK = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'BODY',
  'DD',
  'DETAILS',
  'DIALOG',
  'DIV',
  'DL',
  'DT',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HGROUP',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'SUMMARY',
  'TABLE',
  'TBODY',
  'THEAD',
  'TFOOT',
  'TR',
  'UL',
  'CAPTION',
  'LEGEND',
  'OPTION',
]);
const PARAGRAPH = new Set([
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'BLOCKQUOTE',
  'PRE',
  'TABLE',
  'UL',
  'OL',
  'DL',
  'FIGURE',
  'HR',
  'SECTION',
  'ARTICLE',
]);

export function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

export interface HtmlToTextOptions {
  keepLinks: boolean;
  keepImagesAlt: boolean;
}

/**
 * Walks the DOM emitting text with explicit break markers, then normalises.
 * Private-use sentinels mark soft line breaks and paragraph breaks.
 */
export function htmlToText(html: string, o: HtmlToTextOptions): string {
  const doc = parseHtml(html);
  const parts: string[] = [];
  // Private-use sentinels (stripped from the input first, so they can't collide with content).
  const LINE = '\ue000';
  const PARA = '\ue001';
  const KEEP = '\ue002'; // a space that must survive whitespace collapsing (pre, list indents)

  const walk = (node: Node, ctx: { pre: boolean; listDepth: number }) => {
    if (node.nodeType === 3) {
      const t = (node.textContent ?? '').replace(/[\ue000-\ue002]/g, '');
      parts.push(
        ctx.pre
          ? t.replace(/\r?\n/g, LINE).replace(/ /g, KEEP).replace(/\t/g, KEEP.repeat(4))
          : t.replace(/[ \t\r\n\f]+/g, ' '),
      );
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    const tag = el.tagName.toUpperCase();
    if (
      SKIP.has(tag) ||
      el.getAttribute('hidden') !== null ||
      el.getAttribute('aria-hidden') === 'true'
    )
      return;
    if (tag === 'BR') {
      parts.push(LINE);
      return;
    }
    if (tag === 'IMG') {
      const alt = el.getAttribute('alt')?.trim();
      if (o.keepImagesAlt && alt) parts.push(`[${alt}]`);
      return;
    }
    if (tag === 'INPUT') {
      const type = el.getAttribute('type');
      if (type === 'checkbox') parts.push(el.hasAttribute('checked') ? '[x] ' : '[ ] ');
      return;
    }
    const isBlock = BLOCK.has(tag);
    const isPara = PARAGRAPH.has(tag);
    if (isBlock) parts.push(isPara ? PARA : LINE);
    if (tag === 'LI') {
      const parent = el.parentElement;
      const indent = KEEP.repeat(2 * Math.max(0, ctx.listDepth - 1));
      if (parent?.tagName.toUpperCase() === 'OL') {
        const start = Number(parent.getAttribute('start') ?? '1') || 1;
        const index = Array.from(parent.children)
          .filter((c) => c.tagName.toUpperCase() === 'LI')
          .indexOf(el);
        parts.push(`${indent}${start + index}. `);
      } else parts.push(`${indent}- `);
    }
    if (tag === 'HR') parts.push('———');
    const childCtx = {
      pre: ctx.pre || tag === 'PRE' || tag === 'TEXTAREA',
      listDepth: tag === 'UL' || tag === 'OL' ? ctx.listDepth + 1 : ctx.listDepth,
    };
    if (tag === 'TR') {
      const cells = Array.from(el.children).filter((c) => /^(TD|TH)$/i.test(c.tagName));
      cells.forEach((cell, i) => {
        if (i > 0) parts.push('\t');
        const before = parts.length;
        cell.childNodes.forEach((c) => walk(c, childCtx));
        // Cells are single-line: fold breaks into spaces.
        for (let j = before; j < parts.length; j++)
          parts[j] = parts[j]!.replace(/[\ue000\ue001]/g, ' ');
      });
      parts.push(LINE);
      return;
    }
    el.childNodes.forEach((c) => walk(c, childCtx));
    if (tag === 'A' && o.keepLinks) {
      const href = el.getAttribute('href') ?? '';
      const text = (el.textContent ?? '').trim();
      if (
        /^(https?:|mailto:)/i.test(href) &&
        href !== text &&
        href.replace(/^mailto:/, '') !== text
      )
        parts.push(` (${href})`);
    }
    if (isBlock) parts.push(isPara ? PARA : LINE);
  };

  walk(doc.body ?? doc.documentElement, { pre: false, listDepth: 0 });
  const joined = parts.join('');
  const lines = joined
    .replace(/[ ]*([\ue000\ue001])[ ]*/g, '$1')
    .replace(/\ue001+/g, '\ue001')
    .replace(/\ue000*\ue001\ue000*/g, '\n\n')
    .replace(/\ue000+/g, '\n')
    .split('\n')
    .map((l) =>
      l
        .replace(/ {2,}/g, ' ')
        .replace(/^ +| +$/g, '')
        .replace(/\ue002/g, ' ')
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+$/g, ''),
    );
  return `${lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
}

export interface HtmlToMarkdownOptions {
  headingStyle: 'atx' | 'setext';
  bullet: '-' | '*';
}

export function htmlToMarkdown(html: string, o: HtmlToMarkdownOptions): string {
  const td = new TurndownService({
    headingStyle: o.headingStyle,
    bulletListMarker: o.bullet,
    codeBlockStyle: 'fenced',
    fence: '```',
    emDelimiter: '_',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  });
  td.use(gfm);
  td.remove([
    'script',
    'style',
    'noscript',
    'template',
    'head',
    'iframe',
    'object',
    'embed',
    'canvas',
    'form',
    'button',
    'select',
  ]);
  // Custom rules take precedence over Turndown's built-ins.
  td.addRule('hidden', {
    filter: (node) =>
      node.nodeType === 1 &&
      (node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true'),
    replacement: () => '',
  });
  td.addRule('preWithoutCode', {
    filter: (node) => node.nodeName === 'PRE' && !node.querySelector('code'),
    replacement: (_content, node) =>
      `\n\n\`\`\`\n${(node.textContent ?? '').replace(/\n$/, '')}\n\`\`\`\n\n`,
  });
  // Drop the root <html>/<body> wrappers turndown would otherwise walk into from a full document.
  const doc = parseHtml(html);
  const md = td.turndown(doc.body ?? doc.documentElement);
  // Turndown pads list markers to four columns ("-   item"); use the common single space.
  const tidy = md.replace(/^(\s*)([-*]|\d+\.) {2,}(?=\S)/gm, '$1$2 ');
  return `${tidy.replace(/\n{3,}/g, '\n\n').trim()}\n`;
}
