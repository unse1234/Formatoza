---
intro: >-
  AVIF supports a full alpha channel, and more and more logos, stickers, product cut-outs and UI graphics are served
  as AVIF by image CDNs. When you need that image in a tool that doesn't read AVIF — an older editor, a slide deck, a
  design app or a CMS — PNG is the natural target: it is lossless, universally supported and keeps transparency
  exactly.


  This converter decodes the AVIF with your browser's built-in decoder and writes a PNG with the alpha channel intact.
  It works on batches, runs entirely on your device, and nothing is uploaded.
useCases:
  - title: "Logos and cut-outs saved from the web"
    text: >-
      Keep the transparent background when placing a downloaded logo on slides, documents or other designs.
  - title: "Editing without further loss"
    text: >-
      PNG is lossless, so you can edit and re-save repeatedly without adding compression artefacts.
  - title: "Design tools without AVIF support"
    text: >-
      Many versions of Office, older Photoshop releases and various diagram tools import PNG but not AVIF.
  - title: "Screenshots and UI graphics"
    text: >-
      Sharp edges and text stay crisp in PNG instead of picking up JPEG ringing.
limitations:
  - >-
    Requires a browser that decodes AVIF (Chrome/Edge 85+, Firefox 93+, Safari 16.4+).
  - >-
    PNG files are much larger than AVIF — often 5–15× for photographs — because PNG compresses losslessly.
  - >-
    Animated AVIF becomes a still image of the first frame.
  - >-
    10/12-bit and HDR AVIFs are converted to 8-bit sRGB PNG.
faq:
  - q: "Does AVIF to PNG keep the transparent background?"
    a: >-
      Yes. The alpha channel is preserved pixel for pixel, including semi-transparent edges.
  - q: "Is the conversion lossless?"
    a: >-
      The PNG step is lossless. Whatever compression the AVIF already had is baked into its pixels and can't be undone,
      but nothing further is lost.
  - q: "Why is my PNG so large?"
    a: >-
      AVIF is one of the most efficient lossy formats available; PNG stores every pixel exactly. For photos, AVIF to JPG
      gives far smaller files if you don't need transparency.
  - q: "Can I choose the output size?"
    a: >-
      Yes. The Size option scales large images down to a maximum long side, which also reduces the PNG's file size.
---

## PNG as the “working copy” format

AVIF is a delivery format: excellent for shipping pixels to browsers as efficiently as possible, less suited to being
opened, changed and saved again. Each re-encode of a lossy format adds artefacts, and AVIF encoders are slow compared
with JPEG or PNG. PNG is the opposite: slower to transfer, but lossless and understood by every image tool in
existence. Converting AVIF to PNG is how you turn a web asset back into an editable source file.

## What happens to HDR and wide-gamut AVIFs

AVIF can store HDR images using PQ or HLG transfer functions and 10 or 12 bits per channel. Browsers render those
into a standard 8-bit sRGB canvas before the PNG is written, so bright highlights are compressed into the normal
range. For regular web graphics — which are almost always 8-bit sRGB anyway — nothing changes.
