import { Marked, type Token, type Tokens } from 'marked';
import { decodeHtmlEntities } from '../shared/entities';

export interface MarkdownToHtmlOptions {
  gfm: boolean;
  breaks: boolean;
  fullDocument: boolean;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function markdownToHtml(md: string, o: MarkdownToHtmlOptions): string {
  const marked = new Marked({ gfm: o.gfm, breaks: o.breaks, async: false });
  const body = (marked.parse(md.replace(/^﻿/, '')) as string).trim();
  if (!o.fullDocument) return `${body}\n`;
  const title = firstHeading(md) ?? 'Document';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
body{font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#171717}
pre{background:#f4f4f4;padding:1rem;overflow:auto;border-radius:6px}code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9em}
table{border-collapse:collapse}th,td{border:1px solid #ddd;padding:.4rem .6rem}blockquote{margin:0;padding-left:1rem;border-left:3px solid #ddd;color:#555}
img{max-width:100%}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

function firstHeading(md: string): string | undefined {
  const m = /^#{1,6}\s+(.+?)\s*#*\s*$/m.exec(md);
  return m?.[1]?.replace(/[*_`[\]]/g, '');
}

/** Markdown → plain text by walking the marked token tree. */
export function markdownToText(md: string, o: { keepLinks: boolean }): string {
  const tokens = new Marked({ gfm: true }).lexer(md.replace(/^﻿/, ''));

  const inline = (ts: Token[] | undefined): string =>
    (ts ?? [])
      .map((t) => {
        switch (t.type) {
          case 'link': {
            const l = t as Tokens.Link;
            const text = inline(l.tokens);
            return o.keepLinks && l.href && l.href !== text && !l.href.startsWith('#') ? `${text} (${l.href})` : text;
          }
          case 'image':
            return (t as Tokens.Image).text;
          case 'br':
            return '\n';
          case 'codespan':
            return decodeHtmlEntities((t as Tokens.Codespan).text);
          case 'html':
            return (t as Tokens.HTML).text.replace(/<[^>]*>/g, '');
          case 'escape':
            return (t as Tokens.Escape).text;
          default: {
            const withTokens = t as { tokens?: Token[]; text?: string };
            if (withTokens.tokens?.length) return inline(withTokens.tokens);
            return withTokens.text ?? '';
          }
        }
      })
      .join('');

  const block = (ts: Token[], depth = 0): string[] => {
    const out: string[] = [];
    for (const t of ts) {
      switch (t.type) {
        case 'heading':
        case 'paragraph':
          out.push(inline((t as Tokens.Heading | Tokens.Paragraph).tokens));
          break;
        case 'text': {
          const tt = t as Tokens.Text;
          out.push(tt.tokens ? inline(tt.tokens) : tt.text);
          break;
        }
        case 'code':
          out.push((t as Tokens.Code).text);
          break;
        case 'blockquote':
          out.push(block((t as Tokens.Blockquote).tokens, depth).join('\n\n'));
          break;
        case 'list': {
          const l = t as Tokens.List;
          const start = typeof l.start === 'number' ? l.start : 1;
          const items = l.items.map((item, i) => {
            const marker = item.task ? (item.checked ? '[x] ' : '[ ] ') : '';
            const bullet = l.ordered ? `${start + i}. ` : '- ';
            const inner = block(item.tokens.filter((x) => x.type !== 'checkbox'), depth + 1).join('\n');
            const indent = '  '.repeat(depth);
            return inner
              .split('\n')
              .map((line, j) => (j === 0 ? `${indent}${bullet}${marker}${line.trimStart()}` : line.startsWith(indent) ? line : `${indent}  ${line}`))
              .join('\n');
          });
          out.push(items.join('\n'));
          break;
        }
        case 'table': {
          const tb = t as Tokens.Table;
          const rows = [tb.header.map((c) => inline(c.tokens)), ...tb.rows.map((r) => r.map((c) => inline(c.tokens)))];
          out.push(rows.map((r) => r.join('\t')).join('\n'));
          break;
        }
        case 'html':
          {
            const text = (t as Tokens.HTML).text.replace(/<[^>]*>/g, '').trim();
            if (text) out.push(text);
          }
          break;
        case 'hr':
        case 'space':
        case 'def':
          break;
        default: {
          const withTokens = t as { tokens?: Token[]; text?: string };
          if (withTokens.tokens) out.push(inline(withTokens.tokens));
          else if (withTokens.text) out.push(withTokens.text);
        }
      }
    }
    return out.filter((s) => s.trim() !== '');
  };

  const text = block(tokens).join('\n\n');
  return `${decodeHtmlEntities(text).replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}
