---
intro: >-
  PNG is perfect for screenshots and graphics, but a photo or a large screenshot saved as PNG can easily be 5–20 MB —
  too big for email attachments, chat apps and upload forms with size limits. Converting to JPG typically shrinks it by
  70–90% with no visible difference at normal viewing sizes.


  Because JPG can't store transparency, you choose the background color that replaces transparent areas, as well as
  the JPEG quality. Batch-convert up to 50 files and download them one by one or as a ZIP. The conversion runs in your
  browser; nothing is uploaded.
useCases:
  - title: "Getting under upload size limits"
    text: >-
      Forms that cap files at 2 MB or 5 MB will usually accept a JPG version of a large PNG photo or screenshot.
  - title: "Emailing photos"
    text: >-
      Smaller attachments send faster and don't bounce off mailbox size limits.
  - title: "Transparent logos on a solid background"
    text: >-
      Export a transparent PNG logo onto white or your brand color where only JPG is accepted.
  - title: "Photos exported as PNG by mistake"
    text: >-
      Some apps and screenshot tools save photos as PNG; JPG is the more appropriate format for photographic content.
limitations:
  - >-
    Transparency is flattened onto the chosen background color. Semi-transparent edges are blended with that color, so
    pick the color of the page or document where the image will appear.
  - >-
    JPG is lossy. Sharp text and thin lines in screenshots can show slight fuzziness (ringing) at lower quality
    settings; use 90% or above for text-heavy images.
  - >-
    Very large PNGs may be scaled down on iPhones and iPads due to Safari's canvas size limit; the tool warns you if so.
faq:
  - q: "What happens to the transparent background?"
    a: >-
      It is filled with the background color from Settings — white unless you choose another. JPG has no way to store
      transparency.
  - q: "How much smaller will the JPG be?"
    a: >-
      For photos, commonly 70–90% smaller. For flat graphics with few colors the saving is smaller, and PNG may even be
      the better format.
  - q: "Which quality should I choose for screenshots?"
    a: >-
      90–95%. Screenshots contain sharp text, which JPEG compression softens at lower settings. For photos, 80–90% is
      plenty.
  - q: "Is my screenshot uploaded to a server?"
    a: >-
      No. The PNG is decoded and the JPG is encoded by your browser, on your device.
---

## When JPG is the right call — and when it isn't

JPEG was designed for photographs: continuous tones, soft gradients, natural texture. It handles those extremely
efficiently. It was *not* designed for flat areas of color and hard edges, which is why a JPG of a UI screenshot or a
logo can show faint blotches around text. A useful rule:

- **Photo, or a screenshot containing mostly photos/video frames** → JPG, quality 80–90%.
- **Screenshot of text, code or UI** → JPG at 90–95% if you must, but PNG or WebP is usually better.
- **Logo, icon, diagram** → keep PNG unless the destination demands JPG.

## Choosing a background color

Transparent pixels are composited over your chosen color before encoding. Anti-aliased edges are partially
transparent, so they blend into that color — which looks perfect on a matching background and leaves a thin halo on
a different one. If the image will sit on a dark website, pick the site's background color rather than white.
