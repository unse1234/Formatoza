---
intro: >-
  WebP is great for websites but awkward everywhere else: stickers, logos, icons and UI images saved from the web
  often arrive as .webp, and plenty of editors, office apps and design tools won't import them. PNG is the lossless,
  universally supported alternative — and unlike JPG it keeps transparent backgrounds, which is exactly what most of
  those graphics need.


  This tool decodes WebP images in your browser and writes PNG files with the alpha channel intact. Convert a single
  file or a batch, download individually or as a ZIP. All processing happens on your device; nothing is uploaded.
useCases:
  - title: "Stickers and transparent graphics"
    text: >-
      WhatsApp and Telegram stickers and many web cut-outs are WebP; PNG keeps their transparent backgrounds.
  - title: "Logos for presentations and documents"
    text: >-
      Place a transparent logo on slides or letterheads in tools that don't read WebP.
  - title: "Lossless editing"
    text: >-
      Edit and re-save as many times as needed without adding compression artefacts.
  - title: "Assets for apps and games"
    text: >-
      Many game engines, older Android build pipelines and asset tools expect PNG textures and sprites.
limitations:
  - >-
    PNG is lossless but larger: expect files several times bigger than the WebP, especially for photos.
  - >-
    Animated WebP (for example animated stickers) becomes a still PNG of the first frame.
  - >-
    If the WebP was lossy, its compression artefacts are preserved exactly — converting cannot restore lost detail.
faq:
  - q: "Does WebP to PNG keep transparency?"
    a: >-
      Yes. PNG supports a full alpha channel, so transparent and semi-transparent pixels are preserved exactly.
  - q: "Is WebP to PNG lossless?"
    a: >-
      The conversion itself is lossless — every decoded pixel is stored unchanged. If the WebP used lossy compression,
      that earlier loss remains.
  - q: "Should I convert WebP to PNG or JPG?"
    a: >-
      PNG for graphics, screenshots, logos and anything with transparency; JPG for photographs, where PNG files would be
      unnecessarily large.
  - q: "How many files can I convert at once?"
    a: >-
      Up to 50 per batch. You can download each PNG or all of them as one ZIP file.
---

## Lossy and lossless WebP

WebP has two different compression modes. **Lossy WebP** works like JPEG, discarding detail to save space; **lossless
WebP** works like PNG but usually produces files around a quarter smaller. Either mode can carry an alpha channel.
When you convert to PNG, a lossless WebP comes out pixel-identical, and a lossy WebP comes out exactly as it looked —
artefacts included — with no further degradation.

## Why PNG for transparency

JPG simply has no concept of transparency, so converting a transparent WebP sticker to JPG would paint the background
a solid color. GIF supports transparency but only on/off per pixel and only 256 colors, which ruins soft edges and
shadows. PNG's 8-bit alpha channel keeps anti-aliased edges and drop shadows smooth over any background, which is why
it's the standard format for transparent graphics outside the web.
