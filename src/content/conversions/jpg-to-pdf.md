---
intro: >-
  Turning photos into a PDF is one of the most common document chores: receipts for an expense report, pages of a
  signed contract photographed with a phone, homework, ID documents for an application, a portfolio. This converter
  combines one or many JPG images into a single PDF, in the order you choose, with one image per page.


  JPG files are embedded exactly as they are — the JPEG data is placed inside the PDF without being decoded and
  re-compressed — so the pages look identical to your photos and the PDF stays compact. Choose “fit to image”, A4 or US
  Letter pages and optional margins. Everything happens in your browser; no photo is uploaded.
useCases:
  - title: "Expense reports and receipts"
    text: >-
      Combine photos of receipts into one PDF to attach to an expense claim.
  - title: "Signed documents"
    text: >-
      Photograph each signed page and assemble them into a single PDF in the correct order.
  - title: "Applications and ID uploads"
    text: >-
      Visa, rental and job portals often require a single PDF containing several scanned pages.
  - title: "Portfolios and handouts"
    text: >-
      Bundle photos or artwork into one easy-to-share document.
limitations:
  - >-
    Each image becomes one page. The tool doesn't combine several photos on a single page or add text.
  - >-
    Images are placed as pictures, so the PDF's text isn't searchable or selectable. OCR is not performed.
  - >-
    Photos with an EXIF rotation flag are re-encoded at high quality (92%) to store them upright; all other JPGs are
    embedded untouched.
  - >-
    CMYK JPEGs from print workflows are embedded as-is and may display with inaccurate colors in some PDF viewers.
faq:
  - q: "Does converting JPG to PDF reduce image quality?"
    a: >-
      No. JPEG data is embedded directly into the PDF without re-compression, so the pages are pixel-identical to your
      photos. The only exception is photos that need rotating, which are re-encoded at 92% quality.
  - q: "How do I change the page order?"
    a: >-
      Files appear in the order you added them. Use the up and down arrows next to each file to reorder before
      converting.
  - q: "What page size should I choose?"
    a: >-
      “Fit to image” makes each page exactly the size of its photo — ideal for viewing on screen. Choose A4 or US Letter
      if the PDF will be printed or must meet a submission standard.
  - q: "Is there a limit on the number of images?"
    a: >-
      Up to 100 images of up to 60 MB each per PDF. Very large sets may take a while on older phones.
  - q: "Are my photos uploaded?"
    a: >-
      No. The PDF is built entirely inside your browser tab.
---

## Why the PDF is as sharp as your photos

PDF supports JPEG natively through its `DCTDecode` filter: a PDF viewer can decompress JPEG data directly. That means
a converter doesn't need to decode your photo into pixels and compress it again — it can copy the original JPEG bytes
into the PDF and describe where to draw them. This tool does exactly that, which is both lossless and fast. The PDF
ends up only slightly larger than the sum of your JPG files.

## Page sizes, orientation and margins

- **Fit to image** creates pages the same shape as each photo, at 96 pixels per inch — a 3000 × 4000 photo becomes a
  31 × 42 inch page that viewers scale to fit the screen. Mixed portrait and landscape photos each get the right shape.
- **A4 / US Letter** place each photo centred on a standard page, scaled to fit inside the margins.
  “Automatic” orientation turns the page landscape for landscape photos.
- **Margins** add white space around the image, which printers often need because they can't print to the edge.
