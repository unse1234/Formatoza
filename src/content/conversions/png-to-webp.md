---
intro: >-
  PNG screenshots, illustrations and transparent product images are often the largest files on a website. WebP
  supports the same full alpha channel as PNG but compresses far better: lossy WebP with transparency is frequently a
  fraction of the PNG's size, and even at the highest quality setting files are usually smaller.


  This tool converts PNGs to WebP in your browser with a quality setting you control, keeps transparency, and handles
  batches of up to 50 images. Nothing is uploaded; the images stay on your device.
useCases:
  - title: "Transparent product images"
    text: >-
      E-commerce cut-outs keep their transparent background at a fraction of the PNG weight.
  - title: "Documentation screenshots"
    text: >-
      Screenshots in docs and blogs load much faster as WebP at high quality.
  - title: "Illustrations and UI mockups"
    text: >-
      Flat illustrations compress well in WebP while keeping edges crisp at 90%+ quality.
  - title: "Performance budgets"
    text: >-
      Cutting image weight is one of the easiest wins for Largest Contentful Paint.
limitations:
  - >-
    Lossy WebP subsamples color (4:2:0), so very fine colored text or 1-pixel colored lines can blur slightly. Use a
    high quality setting for screenshots of text.
  - >-
    Animated PNG (APNG) files become a still WebP of the first frame.
  - >-
    WebP isn't accepted by every desktop tool or print service; keep the PNG originals for those.
faq:
  - q: "Does PNG to WebP keep transparency?"
    a: >-
      Yes. WebP supports a full 8-bit alpha channel in both lossy and lossless modes, and transparent pixels are
      preserved.
  - q: "How much smaller will my images be?"
    a: >-
      For photos saved as PNG, often 70–90% smaller. For flat graphics and screenshots, typically 25–60% depending on
      the quality setting.
  - q: "What quality should I use for screenshots?"
    a: >-
      90–95% keeps text sharp. Lower settings are fine for photographs and illustrations without small text.
  - q: "Can I convert on my phone?"
    a: >-
      Yes. The page works in mobile browsers; on iPhone and iPad a WebAssembly encoder is used because Safari can't
      create WebP files natively.
---

## Transparency without the PNG weight

PNG stores transparent images losslessly, which is exactly why they're heavy: every pixel's color and alpha value is
kept. WebP can store the color data lossily while keeping transparency smooth, which is ideal for product photos cut
out of their background — the part the eye scrutinises is the object, not the exact noise pattern in its shading.

## Getting good results with screenshots

Screenshots are the hardest case for any lossy format because they combine flat color, sharp edges and small text.
Two tips: keep quality at 90% or above, and avoid downscaling UI screenshots by odd factors, which blurs text before
compression even starts. If a screenshot must stay pixel-perfect — for bug reports, for example — keep it as PNG.
