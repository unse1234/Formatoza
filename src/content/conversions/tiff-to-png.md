---
intro: >-
  TIFF is the standard for scans, archives and print masters, but browsers other than Safari can't display it and
  most web tools won't accept it. PNG is the natural lossless replacement for everyday use: every pixel is kept exactly,
  transparency is supported, and every browser, editor and operating system can open it.


  This converter reads TIFF files in your browser — including multi-page TIFFs, converted page by page — and writes one
  PNG per page. It supports common TIFF compressions and never uploads your files.
useCases:
  - title: "Viewing scans in a browser"
    text: >-
      PNG pages display in any browser or document viewer without special software.
  - title: "Lossless archive copies for the web"
    text: >-
      Publish archival scans online without introducing JPEG artefacts.
  - title: "Document images for OCR or analysis"
    text: >-
      Many OCR and image-analysis tools accept PNG but not TIFF; lossless pixels give the best recognition.
  - title: "Design assets with transparency"
    text: >-
      TIFFs with an alpha channel keep their transparency when converted to PNG.
limitations:
  - >-
    16-bit, 32-bit float and CMYK TIFFs are converted to 8-bit RGB(A); precision beyond 8 bits per channel is lost.
  - >-
    Some rare encodings (old-style JPEG compression, tiled or floating-point images) may not decode; those pages are
    reported and skipped.
  - >-
    Layers, ICC color profiles and metadata such as GeoTIFF tags are not carried into the PNG.
  - >-
    PNG files of photographic TIFFs remain large because the compression is lossless.
faq:
  - q: "Is TIFF to PNG lossless?"
    a: >-
      For standard 8-bit RGB or grayscale TIFFs, yes — pixels are identical. Higher bit depths are reduced to 8 bits per
      channel.
  - q: "Are multi-page TIFFs supported?"
    a: >-
      Yes. Every page becomes a separate PNG, and you can download them all as a ZIP.
  - q: "Will the PNG be smaller than the TIFF?"
    a: >-
      Usually, if the TIFF was uncompressed. An LZW- or Deflate-compressed TIFF will be roughly the same size as the PNG.
  - q: "Does it keep transparency?"
    a: >-
      Yes, when the TIFF contains an alpha channel.
---

## Choosing PNG over JPG for scans

Scanned text is made of sharp, high-contrast edges — the worst case for JPEG compression, which introduces faint
noise around every letter. PNG avoids that entirely and compresses mostly-white pages efficiently, often ending up
close to JPG in size for black-and-white documents. For color photographs, JPG will be much smaller; for documents,
line art and anything that will be processed by software, PNG is the better target.

## Bit depth and color models

TIFF supports far more than the 8-bit RGB used on the web: 16-bit channels for editing headroom, CMYK for print,
Lab color, even floating-point data. This converter maps all of those to 8-bit RGB (with alpha when present), which is
right for viewing and sharing but not for continuing a professional print workflow — keep the TIFF for that.
