---
intro: >-
  Screenshots, scanned pages saved as PNG, diagrams and slides exported as images often need to be delivered as one PDF
  — for a bug report, a set of instructions, a submission portal or printing. This converter combines PNG images into
  a single PDF, one image per page, in the order you set.


  PNG pixels are stored losslessly in the PDF, so text in screenshots stays razor sharp. Transparent areas show the
  white page underneath. Choose fit-to-image, A4 or US Letter pages and margins. The PDF is built in your browser; your
  images are not uploaded.
useCases:
  - title: "Step-by-step guides"
    text: >-
      Assemble a sequence of screenshots into a PDF guide colleagues can scroll through or print.
  - title: "Bug reports and audits"
    text: >-
      Bundle evidence screenshots into one document with a fixed order.
  - title: "Scans saved as PNG"
    text: >-
      Many scanning apps export PNG; combine the pages into a single PDF for submission.
  - title: "Slides and diagrams"
    text: >-
      Turn exported slide images or diagrams into a shareable PDF handout.
limitations:
  - >-
    Screenshot text becomes part of an image; the PDF isn't searchable and text can't be selected (no OCR).
  - >-
    PNG data is stored losslessly, so PDFs built from large screenshots or photos saved as PNG can be big. Convert
    photos to JPG first if size matters.
  - >-
    Transparent regions appear as the white page background.
faq:
  - q: "Is PNG to PDF lossless?"
    a: >-
      Yes. PNG pixel data is embedded with lossless compression, so screenshots and text stay pixel-perfect.
  - q: "Why is my PDF larger than expected?"
    a: >-
      Lossless images can't shrink much, especially photographs saved as PNG. For photos, converting to JPG first and
      then using JPG to PDF produces much smaller documents.
  - q: "Can I mix PNG and JPG files?"
    a: >-
      This page is for PNG files. If you need both, convert PNGs to JPG or use each tool separately; mixed inputs are
      planned.
  - q: "How do I reorder pages?"
    a: >-
      Use the up and down arrows next to each file before you convert; the PDF follows the list order.
---

## How PNGs are stored inside a PDF

PDF has no “PNG” image type, but it supports the same compression PNG uses (Flate/DEFLATE) and optional soft masks for
transparency. The converter decodes each PNG and writes its pixels as a Flate-compressed image plus, when needed, an
alpha mask. The result is lossless: zoom in on a screenshot in any PDF viewer and every pixel is exactly as captured.

## Making screenshot PDFs readable

For documentation, “Fit to image” is often best: each page is exactly the size of its screenshot, so viewers can zoom
to fit without white space. For printing, choose A4 or Letter with a small margin; wide screenshots automatically get
landscape pages when orientation is set to Automatic.
