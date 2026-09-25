---
intro: >-
  AVIF and WebP are both modern web formats, but they are not equally supported. WebP has worked in every major
  browser since Safari 14 (2020) and is accepted by most CMSs, email builders and social platforms; AVIF support is
  newer and still missing in many upload forms and older devices. Converting AVIF to WebP keeps the web-friendly file
  size and transparency while widening compatibility.


  Choose a quality level, convert as many files as you like, and download them individually or as a ZIP. The
  conversion uses your browser's AVIF decoder and a WebP encoder that runs on your device; no image is uploaded.
useCases:
  - title: "Platforms that reject AVIF"
    text: >-
      Some site builders, marketplaces and ad networks accept WebP but not yet AVIF uploads.
  - title: "Supporting older Safari versions"
    text: >-
      Safari 14–16.3 displays WebP but not AVIF. WebP reaches those users without falling back to a heavy JPG.
  - title: "Keeping transparency"
    text: >-
      Both formats support alpha; converting to WebP keeps transparent backgrounds that a JPG would lose.
  - title: "Faster encoding pipelines"
    text: >-
      WebP encodes much faster than AVIF, which matters if you're going to keep editing and re-exporting the asset.
limitations:
  - >-
    WebP files are typically 10–30% larger than well-encoded AVIFs of the same visual quality.
  - >-
    Both formats are lossy by default, so converting adds one more round of compression. Use a high quality setting
    (85–95%) to minimise it.
  - >-
    Animated AVIF becomes a still WebP of the first frame.
  - >-
    HDR/10-bit AVIF is reduced to 8-bit sRGB because WebP doesn't support HDR.
faq:
  - q: "Is WebP or AVIF better?"
    a: >-
      AVIF usually compresses better, especially at low bitrates, and supports HDR. WebP is supported more widely and
      encodes faster. For maximum reach with small files, many sites serve AVIF with a WebP fallback.
  - q: "Will the transparency survive?"
    a: >-
      Yes. WebP supports a full alpha channel and transparent pixels are preserved.
  - q: "Does this work in Safari?"
    a: >-
      Yes, on Safari 16.4 or later (for AVIF decoding). Safari can't encode WebP natively, so a WebAssembly encoder is
      downloaded the first time.
  - q: "What quality should I pick?"
    a: >-
      The default 85% preserves detail well. Because you are converting from one lossy format to another, avoid going
      much lower than 80% or artefacts from both encoders can stack up.
---

## Two generations of web image formats

WebP (2010) was Google's answer to JPEG and PNG on the web, derived from the VP8 video codec. AVIF (2019) applies the
same idea to the newer AV1 codec and squeezes images further. Browsers adopted WebP everywhere by 2020; AVIF followed
in 2023 when Safari 16.4 shipped full support. Tools outside the browser lag several years behind, and many still
treat AVIF as unknown while happily accepting WebP.

## Avoiding double-compression artefacts

Every lossy encode throws away information. Converting between two lossy formats means the WebP encoder sees an
image that already has AVIF's smoothing and has to spend bits reproducing it. Using a quality setting at or above the
one the original was encoded with — 85% to 95% in practice — keeps the result visually identical. If the AVIF came
from a high-quality source you still have, converting that source directly will always give a slightly better WebP.
