---
title: "Images to PDF and Back: Page Size, DPI and Quality"
metaDescription: "How to combine photos into a PDF without losing quality, which page size to choose, and what DPI means when turning PDF pages into JPG or PNG images."
h1: "Images to PDF and back: page sizes, resolution and quality"
summary: "What happens to quality when images go into a PDF, how to choose page sizes, and how DPI works when rendering pages as images."
category: pdf
published: 2026-09-25
updated: 2026-09-25
tools: [jpg-to-pdf, png-to-pdf, heic-to-pdf, webp-to-pdf, pdf-to-jpg, pdf-to-png, pdf-to-webp, pdf-to-text]
---

PDF and images meet constantly: photos of documents need to become one PDF, and PDF pages need to become pictures for
slides, social media or previews. Both directions involve choices — page size, resolution, format — that determine
whether the result looks crisp or blurry and whether the file is tiny or enormous.

## Part 1: Images into a PDF

### Does the image quality change?

It depends on the image format and the converter. PDF can store JPEG data directly, so a good converter copies your JPG
bytes into the PDF without re-compressing them — the page is pixel-identical to the photo. [JPG to PDF](/jpg-to-pdf/)
does this. PNG images are stored with lossless compression, so they're exact too ([PNG to PDF](/png-to-pdf/)).

Formats PDF doesn't support — WebP and HEIC — must be decoded and re-encoded, usually as a high-quality JPEG. At 90%+
quality the difference isn't visible, but it is a second compression step.

### Page size: fit, A4 or Letter?

- **Fit to image** makes each page the exact shape of its image. Best for reading on screen; no white borders.
- **A4** (210 × 297 mm) is the standard almost everywhere outside North America.
- **US Letter** (8.5 × 11 in) is standard in the US and Canada.

Choose a fixed size when the PDF will be printed or must follow a submission rule. Add a margin for printing — most
printers can't print right to the edge.

### Order matters

Pages follow the order of your files. Rename files with numbers (01, 02…) before adding them, or reorder in the
converter's file list.

### Photographing documents well

For readable document PDFs from phone photos: shoot from directly above in even light, fill the frame, avoid shadows,
and hold still. The iPhone Notes/Files scanner and many Android camera apps can also crop and flatten pages before you
combine them — then use [HEIC to PDF](/heic-to-pdf/) or [JPG to PDF](/jpg-to-pdf/).

## Part 2: PDF pages into images

### What DPI means for a PDF

PDF pages are measured in points (1/72 of an inch). When you render a page as an image, the *DPI* (dots per inch)
decides how many pixels each inch becomes:

| DPI | A4 page in pixels | Use for |
|---|---|---|
| 72 | 595 × 842 | Thumbnails |
| 150 | 1240 × 1754 | Screens, slides, social media |
| 300 | 2480 × 3508 | Printing, zooming into detail |

Because most PDF content is vector-based, a higher DPI genuinely adds sharpness: text is re-drawn at the higher
resolution rather than enlarged. Embedded photos can't gain detail beyond their own resolution.

### JPG, PNG or WebP?

- **PNG** — lossless; best for text, charts and line drawings. [PDF to PNG](/pdf-to-png/)
- **JPG** — much smaller for pages with photographs; universally supported. [PDF to JPG](/pdf-to-jpg/)
- **WebP** — smallest for web previews; every browser shows it. [PDF to WebP](/pdf-to-webp/)

### Selecting pages

You rarely need every page. Page ranges like `1-3, 7, 10-` convert exactly what you want and save time and memory on
long documents.

## When you need the words, not a picture

An image of a page isn't searchable or selectable. To reuse the text, extract it with [PDF to Text](/pdf-to-text/).
That works for PDFs created digitally; scanned PDFs contain only images and need OCR first.

## Privacy

Documents converted to or from PDF are often sensitive: IDs, contracts, medical forms. The converters on this site run
entirely in your browser, so the files are processed on your device and never uploaded.
