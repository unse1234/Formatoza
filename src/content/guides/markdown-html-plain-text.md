---
title: "Markdown, HTML and Plain Text: Converting Between Them"
metaDescription: "When to write in Markdown, publish as HTML or strip to plain text — and what each conversion keeps, what it loses, and how to do it safely."
h1: "Markdown, HTML and plain text: converting between them"
summary: "How the three text formats relate, what survives each conversion, and how to handle untrusted HTML safely."
category: developer
published: 2026-09-25
updated: 2026-09-25
tools: [markdown-to-html, html-to-markdown, html-to-text, markdown-to-text]
---

Markdown, HTML and plain text form a ladder. **Plain text** has only characters and line breaks. **Markdown** adds a
small set of formatting marks that stay readable as text. **HTML** can express everything a web page needs. Moving down
the ladder always loses information; moving up requires a parser that knows the rules.

## Markdown → HTML

Markdown was designed to be converted to HTML. The details matter, though: the original 2004 syntax was ambiguous, so
**CommonMark** (2014) specified it precisely and **GitHub Flavored Markdown** added tables, task lists, strikethrough and
autolinks. Converters differ in which of these they support — [Markdown to HTML](/markdown-to-html/) implements
CommonMark with GFM.

Two behaviours surprise people:

- **Single line breaks** don't create `<br>`; a blank line is needed for a new paragraph. GitHub comments and many chat
  apps treat single breaks as line breaks, which is why a “breaks” option exists.
- **Raw HTML passes through.** Markdown allows HTML inline, so converted output can contain anything the author wrote,
  including scripts. Sanitise HTML generated from Markdown you didn't write before publishing it.

## HTML → Markdown

Converting HTML to Markdown is how content escapes a CMS or a web page. Structure maps cleanly — headings, paragraphs,
emphasis, links, lists, code, blockquotes, simple tables. Presentation doesn't: colors, fonts, classes, layout `<div>`s
and merged table cells have no Markdown equivalent and are dropped. That's usually the point. See
[HTML to Markdown](/html-to-markdown/).

## HTML → plain text

Stripping tags sounds trivial and isn't. A regular expression that deletes `<…>` glues words together where block
elements met, leaves entities like `&amp;` and `&nbsp;` untouched, and keeps the contents of `<script>` and `<style>`.
A proper conversion parses the HTML, skips non-content elements, inserts line breaks at block boundaries, keeps list
bullets and table rows readable, and decodes entities. [HTML to Text](/html-to-text/) does this with the browser's own
HTML parser.

Plain text is what email clients show when they can't render HTML, what search indexes and language models work best
with, and what forms without rich-text support need.

## Markdown → plain text

Markdown is already readable, but symbols like `**`, `#` and `[text](url)` look like noise in contexts that don't render
them — app store descriptions, SMS, text-to-speech. Deleting symbols with find-and-replace breaks legitimate asterisks
and underscores (`2 * 3`, `snake_case`). Parsing first and emitting only text nodes is reliable:
[Markdown to Text](/markdown-to-text/).

## What survives each conversion

| Feature | MD → HTML | HTML → MD | HTML → Text | MD → Text |
|---|---|---|---|---|
| Headings | ✓ | ✓ | as lines | as lines |
| Bold / italic | ✓ | ✓ | — | — |
| Links | ✓ | ✓ | optional URL | optional URL |
| Lists | ✓ | ✓ | bullets kept | bullets kept |
| Tables | GFM ✓ | simple ✓ | tab-separated | tab-separated |
| Images | ✓ | as links | optional alt | alt text |
| Colors, fonts, layout | — | dropped | dropped | — |

## Handling untrusted HTML safely

HTML from other people can contain scripts, event handlers (`onerror=…`), `javascript:` links and remote resources.
When converting, parse it in an inert document where scripts never execute and nothing is fetched. When displaying it,
sanitise it (for example with DOMPurify) and, ideally, render it in a sandboxed frame. The converters on this site do
both for their previews.
