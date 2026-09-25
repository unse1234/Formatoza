---
intro: >-
  iPhones are the most common document scanners in the world, but they save photos as HEIC — and HEIC can't go into a
  PDF directly. This converter takes photos of documents, receipts, forms or whiteboards straight from HEIC to a single
  PDF, one photo per page, in the order you choose.


  Each photo is decoded (natively in Safari 17+, otherwise with a one-time decoder download), stored as a high-quality
  JPEG inside the PDF, and placed on a fitted, A4 or US Letter page. You can reorder pages and set margins. The photos
  never leave your device.
useCases:
  - title: "Photographed paperwork"
    text: >-
      Turn iPhone photos of forms, letters and contracts into a single PDF for email or upload.
  - title: "Receipts and invoices"
    text: >-
      Collect a month of receipt photos into one PDF for bookkeeping.
  - title: "School and university submissions"
    text: >-
      Submit handwritten homework photographed on an iPhone as the single PDF most learning platforms require.
  - title: "Whiteboards and notes"
    text: >-
      Keep meeting whiteboard photos together in one shareable document.
limitations:
  - >-
    PDF can't store HEIC, so photos are re-encoded as JPEG (92% quality by default) — visually identical, but a
    separate lossy step.
  - >-
    No perspective correction, cropping or contrast enhancement is applied; for scanner-style results use the iPhone
    Notes or Files document scanner first.
  - >-
    Pages are images, so the text in the PDF is not searchable (no OCR).
  - >-
    Very large photos may be scaled down on iPhone and iPad because of Safari's canvas size limit.
faq:
  - q: "Can I make a PDF from iPhone photos without an app?"
    a: >-
      Yes. Open this page in Safari, choose “Choose files”, select photos from your library, reorder if needed, and
      download the PDF.
  - q: "Are my iPhone photos uploaded to a server?"
    a: >-
      No. They are decoded and assembled into a PDF inside your browser.
  - q: "How big will the PDF be?"
    a: >-
      Roughly 1.5–2× the size of the HEIC photos at the default quality. Lower the quality or choose A4/Letter with
      margins to keep large photo sets manageable.
  - q: "Why not convert to JPG first?"
    a: >-
      You don't need to. This tool decodes HEIC and encodes the PDF images in one pass, avoiding an extra compression
      step.
---

## From HEIC photo to PDF page

A PDF page can contain JPEG images, JPEG 2000 images or losslessly compressed pixels — but not HEVC-compressed HEIC.
The converter therefore decodes each HEIC photo, draws it upright (HEIC stores rotation separately from the pixels),
and encodes it as a JPEG at the quality in Settings before placing it on the page. Doing this in a single pass avoids
the double compression you'd get from converting to JPG with one tool and building the PDF with another.

## Tips for readable document photos

Shoot straight above the page in even light, fill the frame, and avoid shadows from your phone. Choose A4 or US Letter
with a normal margin if the PDF will be printed; choose “Fit to image” for PDFs that will only be read on screen.
