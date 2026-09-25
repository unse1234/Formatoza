---
intro: >-
  If an iPhone photo is headed for a website, a blog, an online store or a CMS, WebP is usually a better target than
  JPG: every current browser displays it, and it produces noticeably smaller files at the same visual quality, which
  helps page speed. This converter takes HEIC photos straight to WebP in one step, instead of going through JPG first
  and compressing the image twice.


  Pick a quality level, convert a batch and download the results. Decoding and encoding happen in your browser — HEIC
  natively in Safari 17+, via a one-time decoder download elsewhere — so the photos never leave your device.
useCases:
  - title: "Product photos for an online shop"
    text: >-
      Shopify, WooCommerce and most modern platforms accept WebP, and smaller images make product pages load faster on mobile.
  - title: "Blog and CMS uploads"
    text: >-
      WordPress has accepted WebP uploads since version 5.8; uploading WebP directly avoids plugins that re-compress later.
  - title: "Improving Core Web Vitals"
    text: >-
      A lighter hero image improves Largest Contentful Paint. Combine WebP with the Size option to cut bytes further.
  - title: "Keeping a single conversion step"
    text: >-
      Going HEIC → JPG → WebP compresses twice. Converting directly avoids the intermediate loss.
limitations:
  - >-
    WebP is less universally supported than JPG in desktop software and email; for attachments or printing, prefer
    HEIC to JPG.
  - >-
    Lossy WebP stores color at reduced resolution (4:2:0 chroma subsampling), so thin, saturated lines — red text on
    blue, for example — can look slightly soft.
  - >-
    Only the main still image is converted: no Live Photo video, burst frames, depth data or EXIF metadata.
  - >-
    Safari cannot encode WebP from a canvas, so in Safari a WebAssembly WebP encoder is downloaded and used instead.
    Results are equivalent; the first conversion takes a moment longer.
faq:
  - q: "Is WebP smaller than JPG for photos?"
    a: >-
      Usually, yes. Google's published comparison found lossy WebP 25–34% smaller than JPEG at equivalent quality.
      Exact savings depend on the photo; very detailed images save less.
  - q: "What quality should I use for websites?"
    a: >-
      75–85% is a good range for web photos. The default of 85% is visually clean for most images; drop to 75% for
      large hero backgrounds where file size matters most.
  - q: "Is WebP smaller than the original HEIC?"
    a: >-
      Not usually. HEIC's HEVC compression is very efficient, so a WebP at similar quality is often a bit larger. The
      point of converting is compatibility — browsers display WebP but most don't display HEIC.
  - q: "Can I convert several photos at once?"
    a: >-
      Yes, up to 50 per batch. Download them one by one or all together as a ZIP.
---

## HEIC on the web: why browsers need a different format

HEIC would be an excellent web format on paper — it compresses photos about as well as AVIF — but browser vendors
other than Apple never shipped HEVC image decoding, largely because of patent licensing. Only Safari 17 and later
display HEIC in a web page. Publishing an iPhone photo therefore means converting it to something every browser
understands, and WebP is the most efficient format with truly universal browser support today.

## Getting the smallest good-looking file

Two settings matter far more than anything else:

1. **Size** — a current iPhone photo is 4032 × 3024 pixels or larger. Even on a high-density display, a blog content
   column rarely needs more than 1920 px. Downsizing cuts file size roughly with the square of the scale.
2. **Quality** — between 75% and 85% most photos look identical to the original on screen.

Set both, convert once, and upload the WebP as-is so your CMS doesn't need to re-compress it.
