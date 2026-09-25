---
intro: >-
  Markdown is how developers and writers draft content — READMEs, docs, notes, changelogs — but CMS editors, email
  builders and many web tools need HTML. This converter renders Markdown to clean, semantic HTML using a
  CommonMark-compliant parser with GitHub Flavored Markdown extensions: tables, task lists, strikethrough and
  autolinks. Output updates as you type, with a switch between the HTML source and a rendered preview.


  Choose whether single line breaks become <br> tags and whether to wrap the result in a complete HTML document with a
  title and basic styling. Everything runs in your browser.
useCases:
  - title: "Publishing to a CMS"
    text: >-
      Write in Markdown, paste the HTML into WordPress, Ghost, Webflow or any rich-text field that accepts HTML.
  - title: "README to web page"
    text: >-
      Turn a GitHub README into a standalone HTML page with tables and code blocks intact.
  - title: "Email and newsletters"
    text: >-
      Draft in Markdown and generate HTML for email tools (add inline styles in your email builder).
  - title: "Documentation snippets"
    text: >-
      Convert docs fragments for systems that store HTML.
limitations:
  - >-
    Raw HTML inside the Markdown is passed through to the output unchanged, as CommonMark specifies. The preview is
    sanitised, but the downloaded HTML contains whatever HTML your Markdown contained.
  - >-
    No syntax highlighting is applied to code blocks; they're output as <pre><code class="language-…"> ready for a
    highlighter such as Prism or highlight.js.
  - >-
    Extensions beyond GFM — footnotes, math, Mermaid diagrams, admonitions, front matter — are not rendered.
  - >-
    Headings don't get automatic id attributes, so there are no anchor links unless your site adds them.
faq:
  - q: "Which Markdown flavour is supported?"
    a: >-
      CommonMark with GitHub Flavored Markdown extensions: tables, task lists, strikethrough (~~text~~) and autolinked
      URLs. Turn GFM off in Settings for strict CommonMark.
  - q: "Why don't my single line breaks show up?"
    a: >-
      In standard Markdown a single newline is just a space; paragraphs need a blank line. Enable “Single line breaks
      become <br>” to match GitHub comments and chat apps.
  - q: "Is the HTML safe to paste into my site?"
    a: >-
      The HTML reflects your Markdown, including any raw HTML you wrote. If the Markdown came from someone else, sanitise
      the output before publishing it.
  - q: "Can I get a complete HTML file?"
    a: >-
      Yes. Enable “Wrap in a complete HTML document” to get <!doctype html>, a <title> from the first heading and simple
      readable styling.
---

## CommonMark and GitHub Flavored Markdown

John Gruber's original 2004 Markdown description left many edge cases undefined — how nested lists indent, when
emphasis ends, what counts as a code block — so different tools rendered the same text differently. CommonMark (2014)
wrote a precise specification with hundreds of test cases, and GitHub Flavored Markdown (GFM) is a strict superset that
adds tables, task lists (`- [x] done`), strikethrough and autolinks. Content written for GitHub renders here the same
way.

## Raw HTML and safety

Markdown allows raw HTML: `<details>`, `<kbd>` or a `<div class="note">` pass straight through, which is useful for
authors. It also means Markdown from untrusted sources can contain `<script>` tags or event handlers. The live preview
on this page is rendered in a sandboxed frame after sanitisation, so nothing executes. The downloadable HTML is the
faithful conversion; sanitise it on your side if the Markdown wasn't yours.
