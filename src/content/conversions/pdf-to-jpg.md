---
intro: >-
  Sometimes a PDF page needs to be a picture: to post a flyer on social media, drop a page into a slide deck, attach a
  preview to a chat message, or upload to a form that doesn't accept PDFs. This converter renders each page of a PDF as
  a JPG image at the resolution you choose — 72, 150 or 300 DPI — and lets you pick exactly which pages to convert.


  Pages are rendered with PDF.js, the open-source engine Firefox uses to display PDFs, so fonts, vector graphics and
  images are drawn faithfully. You can download pages one by one or all at once as a ZIP. The PDF is processed in your
  browser and never uploaded.
useCases:
  - title: "Sharing a page on social media"
    text: >-
      Post a flyer, menu or event poster that exists only as a PDF.
  - title: "Slides and documents"
    text: >-
      Insert a specific PDF page as an image into PowerPoint, Keynote or Google Slides.
  - title: "Forms that reject PDFs"
    text: >-
      Some upload fields accept only images; convert just the page you need.
  - title: "Previews and thumbnails"
    text: >-
      Generate cover images for a document library or website.
limitations:
  - >-
    Text in the JPG is part of the picture and can't be selected or searched. Use PDF to Text to extract the words.
  - >-
    Password-protected PDFs can't be opened. Remove the password in a PDF reader first.
  - >-
    Up to 300 pages are rendered per run to protect your browser's memory; use the page selector for longer documents.
  - >-
    Very large pages at 300 DPI can exceed canvas limits on phones and are rendered at a lower resolution automatically.
  - >-
    Rare PDF features — some XFA forms, uncommon font encodings — may render differently from Adobe Acrobat.
faq:
  - q: "What DPI should I choose?"
    a: >-
      150 DPI for screens, slides and social media (an A4 page becomes about 1240 × 1754 px). 300 DPI for printing or
      zooming into fine detail. 72 DPI for small previews.
  - q: "Can I convert only some pages?"
    a: >-
      Yes. Enter pages in Settings, for example “1-3, 7” or “5-” for page 5 to the end. Leave it empty for all pages.
  - q: "Is PDF to JPG or PDF to PNG better?"
    a: >-
      JPG gives much smaller files for pages with photos. PNG keeps text and lines perfectly sharp and is better for
      text-heavy pages and diagrams.
  - q: "Is my PDF uploaded?"
    a: >-
      No. The PDF is opened and rendered inside your browser.
---

## Resolution explained

PDF pages are measured in points, 72 to the inch. Rendering at 150 DPI means scaling each point by 150 / 72 ≈ 2.08, so
an A4 page (595 × 842 points) becomes about 1240 × 1754 pixels, and a US Letter page 1275 × 1650. At 300 DPI those
double to print resolution; file sizes roughly quadruple. Because PDF text and vector graphics are redrawn at each
resolution — not scaled from a fixed bitmap — higher DPI genuinely adds sharpness.

## Why JPG for PDF pages

JPG keeps page images small, which matters when a document has dozens of pages or contains photographs. Its weakness
is small text: JPEG compression adds faint noise around sharp edges. The default 90% quality keeps text clean at 150
DPI; if the page is mostly text and you need pixel-perfect edges, PDF to PNG is the better choice.
