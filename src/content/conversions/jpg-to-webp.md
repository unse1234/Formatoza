---
intro: >-
  Images are usually the heaviest part of a web page, and JPG is no longer the most efficient way to ship photos.
  Re-encoding JPGs as WebP typically cuts their size by a quarter to a third at equivalent visual quality, which speeds
  up page loads and can improve Largest Contentful Paint — one of Google's Core Web Vitals.


  Set the quality, optionally scale large photos down, and convert a whole batch. Your browser's WebP encoder does the
  work (Safari uses a WebAssembly encoder because it can't write WebP natively), and no image ever leaves your device.
useCases:
  - title: "Speeding up a website"
    text: >-
      Replace hero images, galleries and blog photos with lighter WebP versions.
  - title: "Staying within CMS upload limits"
    text: >-
      Smaller files upload faster and fit hosting plans with limited storage or bandwidth.
  - title: "Preparing images for a static site"
    text: >-
      Convert once locally instead of running an image-processing step in your build.
  - title: "Mobile data savings"
    text: >-
      Lighter images matter most for visitors on slow or metered connections.
limitations:
  - >-
    Converting JPG to WebP re-compresses an already-compressed image. Savings are real but smaller than encoding WebP
    from the original, uncompressed source.
  - >-
    Very low-quality JPGs may not shrink much; the encoder spends bits reproducing existing artefacts.
  - >-
    WebP is not accepted everywhere outside the web (some print services, older desktop apps, email clients). Keep your
    JPG originals.
  - >-
    EXIF metadata, including copyright and GPS fields, is not copied to the WebP.
faq:
  - q: "How much smaller is WebP than JPG?"
    a: >-
      Google's study measured lossy WebP files 25–34% smaller than JPEG at the same SSIM quality. On real sites, 20–40%
      savings are typical; resizing oversized photos often saves far more.
  - q: "What quality setting is best for the web?"
    a: >-
      75–85% for most photos. The default of 85% is visually clean; drop to about 75% for large background images.
  - q: "Do all browsers support WebP?"
    a: >-
      Yes — Chrome, Edge, Firefox, Opera and Safari (since version 14 on macOS Big Sur and iOS 14) all display WebP.
  - q: "Will converting remove camera metadata?"
    a: >-
      Yes. The WebP is encoded from pixels, so EXIF data such as location and camera settings is not included — which
      is usually desirable for images published online.
---

## Why WebP is smaller

JPEG compresses each 8×8 block of pixels independently. WebP's lossy mode, derived from the VP8 video codec,
*predicts* each block from neighbouring pixels that have already been decoded and only stores the difference, then
applies an in-loop filter that smooths block edges. On typical photos that prediction step is where most of the
savings come from.

## A practical workflow

1. Keep your original JPGs (or better, your camera originals) as the master copies.
2. Convert with **Size** set to the largest dimension your layout actually displays — 1920 px covers full-width images
   on most screens.
3. Start at **85% quality**, check the result at 100% zoom, and lower it for images where artefacts aren't noticeable.
4. Use the `<picture>` element or your CMS's format settings if you still need a JPG fallback for other platforms.
