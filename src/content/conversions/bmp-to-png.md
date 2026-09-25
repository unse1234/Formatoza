---
intro: >-
  BMP files are usually uncompressed: a 1920 × 1080 screenshot is about 6 MB and a 12-megapixel photo about 36 MB.
  PNG stores exactly the same pixels with lossless compression, typically cutting file size by 50–90% for screenshots
  and graphics, without changing a single pixel. That makes BMP to PNG the safe way to shrink bitmaps from old software,
  scanners, industrial equipment and Windows Paint.


  The converter decodes BMP files in your browser — with a built-in fallback decoder for unusual variants — and writes
  lossless PNGs. Batches are supported, and nothing is uploaded.
useCases:
  - title: "Shrinking screenshots and diagrams"
    text: >-
      Screenshots from older tools saved as BMP become a fraction of the size as PNG with identical pixels.
  - title: "Web and email use"
    text: >-
      Browsers and mail clients handle PNG everywhere, while BMP attachments are clunky and huge.
  - title: "Archiving legacy files"
    text: >-
      Convert old bitmap libraries to a compressed, lossless and widely supported format.
  - title: "Output from scientific or industrial devices"
    text: >-
      Many cameras, microscopes and machines export BMP; PNG keeps every pixel for analysis at a smaller size.
limitations:
  - >-
    Compressed BMP variants (RLE, or BMPs containing embedded JPEG/PNG data) depend on your browser's decoder; the
    fallback decoder handles uncompressed and bitfield BMPs.
  - >-
    Photographs don't compress as dramatically as screenshots; expect roughly 30–60% savings for photos.
  - >-
    Embedded color profiles in BMP v5 headers are not carried over; colors are written as sRGB.
faq:
  - q: "Is BMP to PNG lossless?"
    a: >-
      Yes. PNG compression is lossless, so every pixel in the PNG matches the BMP exactly.
  - q: "How much smaller will my files be?"
    a: >-
      Screenshots and flat graphics often shrink by 80–95%. Photos typically shrink by 30–60%.
  - q: "Does it support 32-bit BMPs with transparency?"
    a: >-
      Yes. When a 32-bit BMP contains alpha values, they are kept in the PNG.
  - q: "Why are BMP files so large in the first place?"
    a: >-
      Most BMPs store raw pixel values row by row with no compression: width × height × 3 bytes for 24-bit color.
---

## Inside a BMP file

A BMP starts with a 14-byte file header and an information header (usually 40 bytes, `BITMAPINFOHEADER`) describing
width, height, bit depth and compression. Pixel rows follow, padded to multiples of four bytes and usually stored
bottom-up — the first row in the file is the bottom of the picture. Palette-based BMPs (1, 4 or 8 bits per pixel) add a
color table. None of this is compressed in the common case, which is why BMPs are simple but enormous.

## Why PNG rather than JPG

PNG keeps the exact pixels, which matters for screenshots, pixel art, scans of documents and any image that will be
measured or analysed. Choose BMP to JPG only when you want the smallest possible file and the image is photographic.
