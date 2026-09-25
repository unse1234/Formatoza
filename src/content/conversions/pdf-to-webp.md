---
intro: >-
  Showing PDF pages on a website — a brochure preview, a catalogue, a menu, the first page of a report — works best with
  lightweight images. WebP produces noticeably smaller files than PNG or JPG at the same visual quality, and every
  current browser displays it. This converter renders PDF pages to WebP at the resolution and quality you choose.


  Pages are rendered by PDF.js in your browser and encoded to WebP locally (with a WebAssembly encoder in Safari).
  Choose all pages or a range such as “1-3”, and download them together as a ZIP. Nothing is uploaded.
useCases:
  - title: "Document previews on a website"
    text: >-
      Show a quick preview of a downloadable PDF without making visitors open it.
  - title: "Online catalogues and menus"
    text: >-
      Publish PDF pages as fast-loading images that work on every phone.
  - title: "Blog posts and newsletters"
    text: >-
      Embed a chart or page from a PDF report as a light image.
  - title: "Thumbnail generation"
    text: >-
      Render the first page at 72 DPI as a small WebP thumbnail.
limitations:
  - >-
    WebP is ideal for web pages but less supported by email clients and desktop software; use PDF to JPG for those.
  - >-
    Lossy WebP can soften very small text; use 90%+ quality or 300 DPI for text-heavy pages.
  - >-
    Text in images isn't searchable — keep the PDF linked for accessibility and search engines.
  - >-
    Password-protected PDFs aren't supported, and at most 300 pages are rendered per run.
faq:
  - q: "How much smaller is WebP than PNG for PDF pages?"
    a: >-
      For pages with photos, often 70–90% smaller. For pure text pages, lossy WebP at high quality is usually 30–60%
      smaller than PNG.
  - q: "Which settings work well for web previews?"
    a: >-
      150 DPI at 80–85% quality for full pages; 72 DPI for thumbnails.
  - q: "Does it work in Safari?"
    a: >-
      Yes. Safari can't create WebP files natively, so a WebAssembly WebP encoder is downloaded automatically.
  - q: "Can I choose which pages to convert?"
    a: >-
      Yes, with the Pages setting — for example “1”, “2-5” or “1, 3, 5-”.
---

## Accessibility and SEO when publishing page images

An image of a page is invisible to screen readers and search engines unless you describe it. When you publish PDF
pages as WebP, give each image meaningful `alt` text, and link to the original PDF (or better, publish the content as
HTML) so the words remain accessible and indexable.

## Balancing sharpness and size

WebP's lossy mode stores color at half resolution and smooths fine detail at lower quality settings. Rendering at a
higher DPI and then letting the browser display the image smaller keeps text crisp on high-density screens: a 150 DPI
render displayed at half size looks sharp on retina displays while staying far smaller than a PNG.
