---
intro: >-
  Copying text out of a PDF viewer is tedious and often scrambles line breaks. This converter reads the text layer of
  a PDF page by page and rebuilds the lines, producing a plain-text file you can search, quote, edit, translate or feed
  to other tools. Pages are separated by clear markers so you can still find where something came from.


  It uses PDF.js, Mozilla's PDF engine, running in your browser — the PDF is never uploaded. If a PDF turns out to be a
  scan with no text layer, the tool says so instead of returning an empty file.
useCases:
  - title: "Quoting and research"
    text: >-
      Pull passages from reports and papers into notes with page references.
  - title: "Feeding AI and analysis tools"
    text: >-
      Give summarisers, search indexes or scripts the text of long PDF documents.
  - title: "Translation"
    text: >-
      Extract text to paste into a translation tool.
  - title: "Reusing content"
    text: >-
      Recover the text of a document when the original Word file is lost.
limitations:
  - >-
    Scanned PDFs contain images of pages, not text; extracting text from them requires OCR, which this tool does not do.
  - >-
    Multi-column layouts may interleave columns, and tables come out as lines of text rather than a grid — reading order
    follows how the PDF was written.
  - >-
    Headers, footers and page numbers are included as ordinary text.
  - >-
    Password-protected PDFs aren't supported. Some PDFs use fonts without Unicode mappings and extract as garbled
    characters.
faq:
  - q: "Why is the output empty or does it say there's no text?"
    a: >-
      The PDF is almost certainly a scan or a photo of pages. It contains pictures, not text, so it needs OCR (optical
      character recognition) first.
  - q: "Why is the text in the wrong order?"
    a: >-
      PDFs store text in whatever order the creating program wrote it, which isn't always reading order — multi-column
      layouts are the usual culprit.
  - q: "Can I remove the page markers?"
    a: >-
      Yes. Turn off “Mark page breaks” in Settings.
  - q: "Does it keep formatting?"
    a: >-
      No. The output is plain text; line breaks are rebuilt from the text positions, but fonts, bold and layout are not.
---

## How a PDF stores text

Inside a PDF, text isn't stored as paragraphs. A page's content stream contains drawing instructions: set this font,
move to these coordinates, show these glyphs. There are no words, lines or paragraphs as such — just positioned runs of
characters. PDF.js reads those runs along with their positions, and the converter starts a new line when the vertical
position changes and inserts spaces where there's a horizontal gap, reconstructing lines the way they appear on the
page.

## The scanned-document problem

A scanner produces an image of each page. Wrapping those images in a PDF makes a document that looks like text but
contains none, which is why selecting text in some PDFs selects nothing. Tools that let you search scans have run OCR
on them and added an invisible text layer. If that layer exists, this converter extracts it; if not, it tells you the
PDF has no text rather than silently producing an empty file.
