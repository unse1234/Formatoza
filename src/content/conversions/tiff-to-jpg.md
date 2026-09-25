---
intro: >-
  TIFF is the workhorse of scanning, print production and archiving, but almost nothing on the web or in everyday
  apps can display it: of the major browsers only Safari opens TIFF, and most upload forms reject it. Converting to JPG
  gives you small, shareable images. Multi-page TIFFs — the kind scanners and fax software produce — are converted page
  by page, one JPG per page.


  The converter decodes TIFF files in your browser (supporting common compressions such as none, LZW, Deflate and
  PackBits), then encodes JPGs at the quality you choose. Nothing is uploaded.
useCases:
  - title: "Sharing scanned documents"
    text: >-
      Turn multi-page scan TIFFs into JPG pages you can email or upload to a portal.
  - title: "Using print-production images online"
    text: >-
      Photographers and designers often deliver TIFF masters; JPG versions are needed for web and social use.
  - title: "Fax and archive exports"
    text: >-
      Fax software and document archives use TIFF; JPGs are easier to view on phones.
  - title: "Reducing storage"
    text: >-
      Uncompressed or LZW TIFFs are large; JPGs are a fraction of the size for everyday viewing copies.
limitations:
  - >-
    Some rare TIFF encodings (old-style JPEG-in-TIFF, certain CCITT fax variants, tiled or floating-point images) may
    not decode; unsupported pages are reported and skipped.
  - >-
    16-bit and CMYK TIFFs are converted to 8-bit RGB, so colors may shift slightly compared with a color-managed print
    workflow.
  - >-
    Layers, alpha channels and metadata (such as ICC profiles and GeoTIFF tags) are not preserved in the JPG.
  - >-
    JPG is lossy; keep the TIFF as your master copy.
faq:
  - q: "What happens with multi-page TIFF files?"
    a: >-
      Each page becomes its own JPG, named with -page-1, -page-2 and so on. You can switch to “First page only” in
      Settings.
  - q: "Why can't my browser open TIFF files?"
    a: >-
      TIFF is a very flexible format with many compression options, and browsers other than Safari never added support.
      This tool includes its own TIFF decoder.
  - q: "Will colors change?"
    a: >-
      For ordinary RGB TIFFs, no. CMYK and 16-bit print files are converted to standard 8-bit RGB, which can shift
      saturated colors.
  - q: "Can I convert TIFF files to a PDF instead?"
    a: >-
      Convert the pages to JPG here, then combine them with the JPG to PDF converter.
---

## One file, many pages

A TIFF file is a chain of *image file directories* (IFDs), each describing one image: dimensions, compression, color
model and where the pixel strips live. Scanners use this to store a whole document in one file, one IFD per page. This
converter walks every directory that holds a full-size image and produces one JPG per page, so a 12-page scan becomes
12 numbered JPGs — ready to download together as a ZIP.

## Compression inside TIFF

TIFF files may be uncompressed or use LZW, Deflate, PackBits, CCITT Group 3/4 fax encoding or JPEG. The decoder used
here covers the common lossless schemes and fax encodings used by scanners. If a page can't be decoded, the tool
tells you which one instead of failing silently.
