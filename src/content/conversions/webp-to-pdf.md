---
intro: >-
  WebP images saved from websites — product photos, infographics, articles captured as images — sometimes need to be
  printed, archived or submitted as a PDF. PDF has no native WebP support, so each image must be decoded and stored in
  a PDF-compatible encoding. This converter does that and combines any number of WebP files into one ordered PDF.


  Opaque WebP images are stored as high-quality JPEG inside the PDF (quality adjustable), and images with transparency
  are stored losslessly so their edges stay clean. Page size, orientation and margins are configurable, and everything
  runs locally in your browser.
useCases:
  - title: "Printing web images"
    text: >-
      Most print dialogs and print shops handle PDF reliably, unlike WebP.
  - title: "Archiving product pages or infographics"
    text: >-
      Collect images saved from the web into one document for records or research.
  - title: "Submitting evidence or references"
    text: >-
      Portals that want one PDF upload accept a combined file instead of loose WebP images.
  - title: "Making a quick lookbook"
    text: >-
      Combine product or design images into a PDF to share with clients.
limitations:
  - >-
    PDF can't contain WebP data, so opaque images are re-encoded as JPEG (92% by default). The difference is not visible
    at normal zoom, but it is a second lossy step.
  - >-
    Animated WebP images contribute only their first frame.
  - >-
    Images are placed as pictures; the PDF text is not searchable.
faq:
  - q: "Why are WebP images re-encoded?"
    a: >-
      The PDF specification supports JPEG, JPEG 2000 and lossless Flate images, but not WebP. Each image must be
      converted into one of those encodings to be viewable in every PDF reader.
  - q: "Will transparent WebPs look right?"
    a: >-
      Yes. Images with transparency are stored losslessly with an alpha mask, so they appear over the white page with
      smooth edges.
  - q: "What quality setting should I use?"
    a: >-
      The default 92% is visually lossless. Lower it to 80–85% to reduce the size of PDFs containing many large photos.
  - q: "Is there a page limit?"
    a: >-
      You can combine up to 100 images per PDF.
---

## Choosing the encoding inside the PDF

For each WebP, the converter checks whether it needs transparency. Opaque images — the vast majority of photos — are
drawn onto white and encoded as JPEG, the most compact image type every PDF reader supports. Images that use an alpha
channel are stored losslessly with a transparency mask so logos and cut-outs keep their clean edges. You get the best
compatibility with the smallest reasonable file.

## Page layout

With “Fit to image” each page matches its picture's shape. For printing, A4 or US Letter with a normal margin centres
each image on the page; landscape images get landscape pages when orientation is Automatic.
