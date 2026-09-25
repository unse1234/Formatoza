---
intro: >-
  Markdown is readable as it is, but the formatting marks still get in the way when text has to go somewhere plain: a
  form field that doesn't render Markdown, an SMS, a word count, a text-to-speech tool, a language-model prompt. This
  converter parses the Markdown properly and outputs clean plain text: headings without #, emphasis without asterisks,
  links reduced to their text, images to their alt text.


  Lists keep their - bullets and numbers, code blocks keep their content, tables become tab-separated lines, and HTML
  entities are decoded. Optionally keep link URLs in parentheses. It all runs in your browser.
useCases:
  - title: "Pasting into plain-text fields"
    text: >-
      App store descriptions, forms and some CRMs show Markdown symbols literally; strip them first.
  - title: "Accurate word and character counts"
    text: >-
      Count only the words readers will see, not the syntax.
  - title: "Text-to-speech and translation"
    text: >-
      Remove markup that TTS engines would read aloud or translators would mangle.
  - title: "Release notes for other channels"
    text: >-
      Reuse a Markdown changelog in an email, SMS or chat message without asterisks and brackets.
limitations:
  - >-
    Emphasis is removed entirely, so any meaning carried only by bold or italics is lost.
  - >-
    Tables become tab-separated lines; wide tables won't line up in proportional fonts.
  - >-
    Raw HTML in the Markdown is reduced to its text content.
  - >-
    Non-standard extensions (footnotes, math, admonitions) are treated as ordinary text.
faq:
  - q: "What happens to links?"
    a: >-
      By default only the link text is kept. Enable “Keep link URLs in parentheses” to get “text (https://…)”.
  - q: "Are list bullets kept?"
    a: >-
      Yes. Bullets become “- ” and numbered lists keep their numbers, with nested lists indented, so structure survives.
  - q: "What about code blocks?"
    a: >-
      The code is kept exactly, without the ``` fences.
  - q: "Why not just delete the symbols with find and replace?"
    a: >-
      Because symbols are ambiguous: an asterisk can be a bullet, emphasis or a literal character. Parsing the Markdown
      removes only real formatting.
---

## Parsing beats pattern matching

A regular expression that deletes `*` and `_` will also destroy `2 * 3`, `snake_case_names` and escaped characters,
and it can't tell a list bullet from emphasis. This converter first parses the Markdown into a syntax tree with a
CommonMark/GFM parser, then walks that tree and emits only the text nodes, with structure-aware spacing between blocks.
Escaped characters (`\*`) come out as the literal character.

## What each element becomes

- `# Heading` → `Heading` on its own line
- `**bold**`, `_italic_`, `~~strike~~` → plain text
- `[text](url)` → `text` (or `text (url)`)
- `![alt](src)` → `alt`
- `- [x] task` → `- [x] task`
- `> quote` → the quoted text
- fenced code → the code content
