---
intro: >-
  PNG is the right image format for PDF pages that consist of text, tables, charts and line drawings: it's lossless,
  so every letter and hairline is rendered perfectly sharp with no JPEG noise. This converter renders PDF pages to PNG at
  72, 150 or 300 DPI, for all pages or just the ones you select.


  Rendering uses PDF.js, Mozilla's PDF engine, running in your browser. Download pages individually or as a ZIP. Your
  PDF is never uploaded.
useCases:
  - title: "Slides and reports"
    text: >-
      Put a chart or table from a PDF report into a presentation with perfectly crisp text.
  - title: "Documentation and wikis"
    text: >-
      Embed PDF pages in Confluence, Notion or a README as sharp images.
  - title: "Design review"
    text: >-
      Export pages of a PDF proof as lossless images to annotate or compare pixel by pixel.
  - title: "Image-based workflows"
    text: >-
      Feed page images to OCR, machine-learning or image-comparison tools that expect lossless input.
limitations:
  - >-
    PNG files of pages with photographs are large; use PDF to JPG for image-heavy documents.
  - >-
    Text in the PNG is not selectable or searchable. Use PDF to Text for the words.
  - >-
    Encrypted PDFs that require a password to open are not supported.
  - >-
    Pages render on a white background; transparency in the PDF is not exported as a transparent PNG.
  - >-
    A maximum of 300 pages is rendered per run.
faq:
  - q: "Why use PNG instead of JPG for PDF pages?"
    a: >-
      PNG is lossless, so text and thin lines stay perfectly sharp. JPG introduces small artefacts around edges but
      produces smaller files for photo-heavy pages.
  - q: "Which resolution gives the best quality?"
    a: >-
      300 DPI is print quality; 150 DPI is sharp on most screens and much smaller. Because PDF content is vector-based,
      higher DPI re-draws the page more finely rather than enlarging pixels.
  - q: "Can I convert a single page?"
    a: >-
      Yes. Enter its number in the Pages setting, e.g. “4”.
  - q: "Do annotations and form fields appear?"
    a: >-
      Annotations with an appearance (highlights, stamps, filled form fields) are rendered as they would print.
---

## Vector pages, rendered at any resolution

Most PDFs describe their content as vectors: text drawn from embedded font outlines and shapes defined by paths. When
PDF.js renders a page, it rasterises those vectors at the scale you request, so a 300 DPI PNG is not an enlarged
72 DPI image — every curve is calculated at full resolution. Embedded photos, of course, can't gain detail beyond
their own resolution.

## File size expectations

A text page at 150 DPI is typically 100–300 KB as PNG: white space and flat colors compress very well losslessly.
Pages with full-bleed photographs can be several megabytes; that's where PDF to JPG or PDF to WebP make more sense.
