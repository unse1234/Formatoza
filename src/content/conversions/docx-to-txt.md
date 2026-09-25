---
intro: >-
  Sometimes all you need from a Word document is the words: to paste into a form, feed to a translation or AI tool,
  count accurately, search, or archive in a format that will never go obsolete. This converter extracts the text from a
  .docx file, keeping paragraphs separated by blank lines and discarding everything else — fonts, styles, images and
  layout.


  The output is UTF-8 plain text, so accents, non-Latin scripts and symbols are preserved. You can convert several
  documents at once, and the files never leave your browser.
useCases:
  - title: "Pasting into plain-text systems"
    text: >-
      Move text into web forms, ticketing systems or code without hidden formatting.
  - title: "Translation and AI tools"
    text: >-
      Provide clean input to translation services, summarisers or language models.
  - title: "Word counts and analysis"
    text: >-
      Count words or analyse the text with scripts and text tools.
  - title: "Long-term archiving"
    text: >-
      Keep a plain-text copy of important documents that any computer can read decades from now.
limitations:
  - >-
    All formatting, images and layout are discarded; lists lose their bullets and numbering.
  - >-
    Table cells are output as separate paragraphs, one per cell, rather than as a grid.
  - >-
    Headers, footers, comments and tracked-change history are not included.
  - >-
    Only .docx files are supported, not legacy .doc, .odt or .rtf.
faq:
  - q: "Are paragraphs kept?"
    a: >-
      Yes. Each paragraph ends with a blank line, so the structure of the text is preserved.
  - q: "What happens to tables in the Word document?"
    a: >-
      Each cell's text becomes its own paragraph, in reading order row by row. Use DOCX to HTML if you need tables.
  - q: "Does it work with .doc files?"
    a: >-
      No. Legacy .doc is a different binary format. Open it in Word, Google Docs or LibreOffice and save as .docx first.
  - q: "Is my document uploaded?"
    a: >-
      No. The .docx is unzipped and read in your browser.
---

## What “plain text” keeps

A Word document mixes content with presentation. Plain text keeps only the content: characters and paragraph breaks.
Headings become ordinary lines, list items lose their bullets, emphasis disappears, and images vanish. What remains
is the most portable form of a document — readable by every editor and program, easy to diff and search, and free of
hidden formatting that can confuse other systems.

## DOCX to TXT versus copy and paste

Copying from Word works for short passages, but for whole documents extraction is more reliable: it doesn't depend on
the clipboard, handles very long files, and processes many documents at once. It also avoids smart-formatting
surprises such as invisible characters from tracked changes being pasted into your target system.
