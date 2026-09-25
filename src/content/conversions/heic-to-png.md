---
intro: >-
  HEIC is the default photo format on iPhones and iPads, but plenty of editors, web tools and operating systems still
  can't read it. Converting to PNG gives you a lossless copy: every decoded pixel is stored exactly, with no second
  round of compression. That makes PNG the right target when the image is about to be edited, cut out, annotated or
  used as source material rather than just shared.


  The converter decodes each HEIC photo locally — natively in Safari 17+, or with a downloaded decoder in other
  browsers — and writes a PNG. It handles batches, runs entirely on your device, and never uploads the photos.
useCases:
  - title: "Editing and retouching"
    text: >-
      Start edits from a lossless PNG so repeated saves in Photoshop, GIMP or Affinity don't add JPEG artefacts.
  - title: "Cut-outs and design work"
    text: >-
      PNG supports transparency, so a photo exported as PNG can have its background removed and stay transparent.
  - title: "Screenshots taken as HEIC"
    text: >-
      Some iOS screenshot and scanning apps save HEIC. PNG keeps sharp text and UI edges crisp, unlike JPG.
  - title: "Archiving a clean master copy"
    text: >-
      A PNG is readable by virtually any software decades from now and doesn't depend on patented codecs.
limitations:
  - >-
    PNG files of photos are large — typically 5–10 times the size of the HEIC — because lossless compression is
    inefficient on camera noise and fine texture. Use HEIC to JPG if you just need to share.
  - >-
    The output is 8 bits per channel in sRGB. HEIC's 10-bit, wide-gamut color is converted, so the most saturated
    colors may shift slightly.
  - >-
    Only the primary image is converted. Live Photo video, burst frames, depth maps and EXIF metadata are not included.
  - >-
    “Lossless” means no quality is lost in the PNG step. The HEIC itself was already lossy-compressed by the camera,
    so converting cannot recover detail that isn't there.
faq:
  - q: "Is HEIC to PNG lossless?"
    a: >-
      The PNG step is lossless: the decoded pixels are stored exactly. The only prior loss is the camera's own HEIC
      compression, which no converter can undo.
  - q: "Why is the PNG so much bigger than the HEIC?"
    a: >-
      HEIC uses a modern lossy video codec, while PNG stores pixels without discarding anything. Photographs contain
      lots of fine noise that lossless compression can't shrink much, so files grow considerably.
  - q: "Will the PNG have a transparent background?"
    a: >-
      Only if the HEIC had transparency, which camera photos don't. PNG gives you the ability to add transparency later
      in an editor.
  - q: "Does this work for HEIF files too?"
    a: >-
      Yes. .heif and .heic are the same container; files with either extension are accepted as long as the images
      inside use HEVC compression.
---

## When PNG beats JPG as the target

Both PNG and JPG open everywhere, so the choice depends on what happens next. If the photo will be edited, layered or
cut out, PNG avoids *generation loss* — the gradual degradation you get every time a JPEG is opened, changed and saved
again. PNG also preserves hard edges and text without the ringing and blockiness JPEG introduces, which matters for
HEIC screenshots, scanned documents and graphics.

If the photo is only going to be viewed or uploaded, the lossless guarantee is wasted: a 3 MB HEIC can become a 20 MB
PNG with no visible benefit over a 4 MB JPG.

## Color and bit depth

Recent iPhones capture HEIC photos in the Display P3 color space, and some modes store 10 bits per channel. Browsers
decode those images and draw them into an 8-bit sRGB canvas before the PNG is encoded. Skin tones and everyday scenes
are unaffected; only extremely saturated colors — a neon sign, a vivid flower — may lose a little intensity. If exact
wide-gamut color matters for professional print work, export from Apple Photos or Lightroom with a color profile
instead.
