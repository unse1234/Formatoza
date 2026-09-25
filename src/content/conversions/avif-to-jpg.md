---
intro: >-
  AVIF images are showing up everywhere: image CDNs, news sites and social platforms serve them to browsers that
  support them, so right-click → “Save image as” increasingly produces a .avif file. Those files look great in Chrome,
  but plenty of places still reject them — older versions of Windows Photos, office documents, email clients, print
  services and many upload forms. Converting to JPG makes the image usable anywhere.


  The converter uses your browser's own AVIF decoder, draws the image, and encodes a JPEG at the quality you set.
  Because JPG has no transparency, you can choose which color fills transparent areas. Everything runs locally; nothing
  is uploaded.
useCases:
  - title: "Images saved from websites"
    text: >-
      Turn AVIF downloads into JPGs you can insert into Word, PowerPoint or Google Docs without compatibility warnings.
  - title: "Printing"
    text: >-
      Photo labs and print kiosks expect JPG; AVIF files are usually rejected or rendered incorrectly.
  - title: "Sending by email"
    text: >-
      Many mail clients show AVIF attachments as unknown files. JPG previews inline everywhere.
  - title: "Legacy or embedded systems"
    text: >-
      Digital photo frames, older TVs and industrial devices typically decode only JPEG.
limitations:
  - >-
    Your browser must support AVIF decoding (Chrome/Edge 85+, Firefox 93+, Safari 16.4+). If it doesn't, the tool
    tells you before you start.
  - >-
    Transparent areas are filled with the background color you choose (white by default) because JPG cannot store
    transparency.
  - >-
    Animated AVIF files are converted to a single still image (the first frame).
  - >-
    HDR and 10/12-bit AVIFs are reduced to 8-bit sRGB, so highlights in HDR images may look flatter than on an HDR
    display.
  - >-
    AVIF is usually far smaller than JPG; expect the JPG to be 2–4× larger at similar visual quality.
faq:
  - q: "Why do websites give me AVIF files?"
    a: >-
      Sites use content negotiation: if your browser says it accepts AVIF, the server or CDN sends the smallest
      format. The same URL might serve a JPG to an older browser.
  - q: "Does converting AVIF to JPG lose quality?"
    a: >-
      A little, because both formats are lossy and the image is re-compressed. At 90% quality the difference is not
      visible in normal use. Artefacts already present in a heavily compressed AVIF will be kept.
  - q: "What happens to the transparent background?"
    a: >-
      JPG has no alpha channel, so transparent pixels are painted with the background color from Settings. Choose
      AVIF to PNG instead if you need to keep transparency.
  - q: "Can I convert AVIF files on my phone?"
    a: >-
      Yes, in any current mobile browser that supports AVIF — Chrome for Android and Safari on iOS 16.4 or later.
---

## AVIF's compatibility gap

AVIF was designed by the Alliance for Open Media — Google, Mozilla, Microsoft, Netflix, Amazon, Apple and others —
as a royalty-free successor to JPEG built on the AV1 video codec. Browser support arrived quickly: Chrome in 2020,
Firefox in 2021, Safari in 2023. Support outside the browser has been much slower. Many desktop viewers, document
editors, messaging apps and back-office systems still don't recognise the format, which is why an image that
displays perfectly on a web page can become a problem the moment you save it.

JPG remains the format with no compatibility questions at all, which is why it's the right target when you need to
hand an image to someone else, put it in a document or print it.

## Transparency and background color

Unlike JPG, AVIF supports a full alpha channel, and logos or product cut-outs served as AVIF often use it. When those
are converted, transparent pixels have to become a solid color. White suits documents and most web pages; black or
your brand color may suit dark designs. Semi-transparent edges are blended with the chosen color, so the cut-out's
anti-aliasing still looks smooth against that background.
