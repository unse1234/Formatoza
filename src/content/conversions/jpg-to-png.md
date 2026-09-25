---
intro: >-
  Converting a JPG to PNG doesn't make the photo sharper — the detail JPEG compression discarded is gone — but it does
  stop things getting worse. Every time a JPG is edited and saved again, it's compressed again and loses a little more
  quality. A PNG copy is lossless, so you can crop, annotate, layer and re-save it as often as you like. PNG is also what
  many design tools, icon generators and upload forms for graphics expect.


  This converter re-encodes JPG and JPEG files as PNG in your browser, applying the camera's orientation so the image
  comes out the right way up. It handles batches, and the images never leave your device.
useCases:
  - title: "Preparing an image for repeated edits"
    text: >-
      Convert once to PNG before a round of edits so each save doesn't add another layer of JPEG artefacts.
  - title: "Adding transparency later"
    text: >-
      PNG supports an alpha channel, so you can remove the background in an editor and keep it transparent.
  - title: "Screenshots and diagrams saved as JPG"
    text: >-
      Text and line art suffer from JPEG ringing; PNG prevents further damage when you annotate them.
  - title: "Tools that require PNG"
    text: >-
      App icon generators, some print-on-demand services and certain upload forms only accept PNG.
limitations:
  - >-
    Converting to PNG cannot remove existing JPEG artefacts or restore lost detail; it only prevents further loss.
  - >-
    PNG files of photos are much larger — commonly 3–8× the JPG size.
  - >-
    The background stays opaque: converting doesn't make anything transparent by itself.
  - >-
    EXIF metadata such as camera model, date and GPS location is not copied to the PNG.
faq:
  - q: "Does converting JPG to PNG improve quality?"
    a: >-
      No. PNG preserves exactly what's in the JPG, including its compression artefacts. What it gives you is protection
      against further loss when you edit and save again.
  - q: "Why is the PNG so much bigger than my JPG?"
    a: >-
      JPEG discards detail to save space; PNG stores every pixel exactly. Photos full of fine texture and noise compress
      poorly without loss.
  - q: "Will the PNG be rotated correctly?"
    a: >-
      Yes. Phone photos often store orientation as an EXIF flag rather than rotating the pixels. The converter applies
      that flag, so the PNG is upright even in software that ignores EXIF.
  - q: "Can I make the background transparent?"
    a: >-
      Not in this tool — it converts formats, it doesn't edit images. Convert to PNG here, then remove the background in
      an image editor; the PNG will keep the transparency.
---

## Generation loss, explained

JPEG compression works on 8×8 pixel blocks, keeping the information your eye notices most and discarding fine
variation. Open a JPG, change something small, and save it: the encoder runs again on pixels that already contain
artefacts, and discards a little more. After several rounds, edges develop halos, flat skies show banding and colors
bleed. Photographers call this *generation loss*.

PNG uses lossless DEFLATE compression, so a PNG saved a hundred times is identical to the first save. That's why
keeping a PNG (or another lossless format) as your working copy and exporting a JPG only at the end is standard
practice.

## Orientation and metadata

Cameras usually store photos in the sensor's native orientation plus an EXIF “Orientation” tag telling viewers how to
rotate them. Some software ignores that tag, which is why photos sometimes appear sideways. This converter bakes the
correct orientation into the PNG's pixels. Because the PNG is written from pixels, EXIF data — including GPS location —
is not carried over.
