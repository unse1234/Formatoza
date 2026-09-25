---
intro: >-
  An uncompressed BMP photo can be 20–40 MB, which is far too big for email, messaging apps and most upload forms.
  Converting it to JPG typically reduces it to 1–4 MB with no visible difference at normal viewing sizes, making the
  image easy to share and store.


  Choose the JPEG quality and optionally downsize large images. The converter handles batches, uses your browser's
  decoder (with a fallback for unusual BMP variants), and runs entirely on your device — nothing is uploaded.
useCases:
  - title: "Emailing scans and photos"
    text: >-
      Bring huge bitmap scans under attachment limits so they send reliably.
  - title: "Uploading to websites"
    text: >-
      Most forms reject BMP outright or cap file size well below a typical BMP.
  - title: "Photos from older cameras and apps"
    text: >-
      Some legacy software saves photos as BMP; JPG is the standard for sharing them.
  - title: "Freeing up storage"
    text: >-
      Convert archives of bitmap photos to JPG to reclaim gigabytes of disk space.
limitations:
  - >-
    JPG is lossy: fine detail is simplified, and screenshots with text can show faint artefacts. Use BMP to PNG for
    screenshots and diagrams.
  - >-
    Transparency in 32-bit BMPs is flattened onto the background color you choose.
  - >-
    Compressed BMP variants depend on browser support; the fallback decoder covers uncompressed and bitfield BMPs.
faq:
  - q: "How much smaller will the JPG be?"
    a: >-
      Commonly 90–95% smaller than an uncompressed BMP photo at 85–90% quality.
  - q: "Should I use JPG or PNG for BMP files?"
    a: >-
      JPG for photos where small size matters; PNG for screenshots, graphics and anything needing exact pixels.
  - q: "Can I resize while converting?"
    a: >-
      Yes. The Size setting scales images down to a maximum long side, such as 1920 px, which reduces size further.
  - q: "Is the conversion private?"
    a: >-
      Yes. Files are decoded and encoded in your browser; they are never uploaded.
---

## From raw pixels to compressed JPEG

A 24-bit BMP spends exactly three bytes on every pixel, whether it's part of a clear blue sky or a detailed face.
JPEG converts the image to a luminance/chrominance representation, stores color at reduced resolution (the eye is far
more sensitive to brightness than color), and uses a discrete cosine transform to keep the visually important
information in each 8×8 block. For photographs, that's where the 10–20× size reduction comes from.

## Quality settings for scans

Document scans saved as BMP are often mostly white paper with dark text. JPEG handles large white areas well but can
blur text at low quality. For readable scans use 90% or higher — or convert to PNG, which is lossless and still much
smaller than the BMP for mostly-white pages.
