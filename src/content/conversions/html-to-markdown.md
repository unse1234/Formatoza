---
intro: >-
  Moving content out of a CMS, a web page or a rich-text editor usually means dealing with HTML full of wrapper
  <div>s, inline styles, classes and scripts. Markdown keeps only what matters — headings, paragraphs, emphasis,
  links, lists, code and tables — in a plain-text format that's easy to edit and diff. This converter turns HTML into
  clean Markdown, dropping scripts, styles, forms and layout wrappers along the way.


  Tables are converted to GitHub Flavored Markdown pipe tables, code blocks are fenced with ```, and you can choose #
  or underlined headings and - or * bullets. Paste HTML or drop .html files; everything runs in your browser.
useCases:
  - title: "Migrating a blog or CMS"
    text: >-
      Convert exported posts to Markdown for Hugo, Jekyll, Astro, Eleventy or Docusaurus.
  - title: "Saving web articles as notes"
    text: >-
      Paste an article's HTML into Obsidian, Notion or Logseq as tidy Markdown.
  - title: "Writing READMEs and docs"
    text: >-
      Turn HTML documentation or rich-text drafts into Markdown for a repository.
  - title: "Cleaning pasted content"
    text: >-
      Strip styling noise from HTML copied out of Word, Google Docs or a web editor.
limitations:
  - >-
    Anything Markdown can't express — colors, fonts, layout, merged table cells, classes — is dropped.
  - >-
    Tables with merged cells, nested tables or block content inside cells may not convert to pipe tables cleanly.
  - >-
    Images are kept as ![alt](src) links; the image files themselves are not downloaded.
  - >-
    Content rendered by JavaScript on the original page isn't in its HTML source and therefore can't be converted.
faq:
  - q: "What happens to scripts and styles?"
    a: >-
      <script>, <style>, <noscript>, <iframe>, forms and similar elements are removed entirely; only content is kept.
  - q: "Are tables supported?"
    a: >-
      Yes. Simple tables become GitHub Flavored Markdown pipe tables with a header row.
  - q: "Can I paste a whole web page?"
    a: >-
      Yes. Paste the full HTML (e.g. from View Source); navigation and footers will be converted too, so trim what you
      don't need.
  - q: "Why are some line breaks different?"
    a: >-
      Markdown uses blank lines to separate paragraphs and collapses extra whitespace, so layout-only line breaks from the
      HTML disappear.
---

## What survives the trip

| HTML | Markdown |
|---|---|
| `<h2>Title</h2>` | `## Title` |
| `<strong>`, `<em>` | `**bold**`, `_italic_` |
| `<a href="…">text</a>` | `[text](…)` |
| `<ul><li>` / `<ol><li>` | `- item` / `1. item` |
| `<pre><code>` | fenced code block |
| `<table>` | pipe table |
| `<img alt src>` | `![alt](src)` |
| `<del>` / `<s>` | `~~text~~` |

Presentation markup — `style`, `class`, `<span>`, `<font>`, layout `<div>`s — carries no meaning in Markdown and is
dropped.

## Parsing safely

The HTML is parsed with the browser's own parser in an inert document: scripts never run and images, fonts and styles
are never fetched. That makes it safe to paste HTML from any source.
