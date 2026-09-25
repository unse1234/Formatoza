---
intro: >-
  Stripping tags with a regular expression produces a mess: words glued together where block elements met, entities
  like &amp;nbsp; left in place, and script code mixed into the text. This converter parses the HTML properly and walks
  the document the way a browser lays it out: paragraphs and headings are separated by blank lines, list items get
  bullets or numbers, table cells are separated by tabs, and <br> becomes a line break.


  Scripts, styles and hidden elements are ignored, entities are decoded, and you can keep link URLs in parentheses or
  image alt text in brackets. Paste HTML or drop files; nothing leaves your browser.
useCases:
  - title: "Plain-text email versions"
    text: >-
      Generate the text/plain part of an HTML email so it reads well in every client.
  - title: "Feeding text to other tools"
    text: >-
      Get clean text for search indexing, word counts, translation tools or language models.
  - title: "Extracting content from web pages"
    text: >-
      Pull the readable text out of saved HTML without markup or scripts.
  - title: "Cleaning database fields"
    text: >-
      Convert HTML stored in CMS or CRM fields to plain text for export.
limitations:
  - >-
    All formatting is removed: no bold, headings or colors — only the text and its structure.
  - >-
    Complex table layouts (merged or nested cells) are flattened into tab-separated lines.
  - >-
    Text rendered by JavaScript, CSS-generated content (::before) and text inside images or SVGs is not included.
  - >-
    Elements hidden with the hidden attribute or aria-hidden are skipped, but elements hidden only via CSS are included.
faq:
  - q: "How is this different from just removing tags?"
    a: >-
      Removing tags loses structure and leaves entities and script code behind. Parsing the HTML keeps paragraphs, lists
      and table rows readable and decodes &amp;, &nbsp; and every other entity.
  - q: "Can I keep the links?"
    a: >-
      Yes. Enable “Keep link URLs in parentheses” to get “our pricing (https://example.com/pricing)”.
  - q: "What happens to tables?"
    a: >-
      Each row becomes a line, with cells separated by tab characters, so you can paste the result into a spreadsheet.
  - q: "Is it safe to paste HTML from unknown sources?"
    a: >-
      Yes. The HTML is parsed in an inert document where scripts never execute and nothing is loaded from the network.
---

## Whitespace, the hard part

In HTML, whitespace in the source mostly doesn't matter: line breaks and runs of spaces collapse into single spaces,
and the visible structure comes from block elements. A good HTML-to-text converter must reproduce that: collapse
source whitespace, insert line breaks at block boundaries, preserve `<pre>` exactly, and avoid piling up blank lines
where empty wrappers nest. That's what this converter's layout pass does, which is why the text reads like the page
rather than like the source code.

## Lists and tables

Unordered list items become `- item`, ordered lists are numbered (respecting a `start` attribute), and nested lists are
indented by two spaces per level. Table rows become single lines with tab-separated cells, which keeps columns aligned
in most editors and pastes cleanly into spreadsheets.
