---
intro: >-
  An .ico file isn't a single image: it's a container holding several sizes of the same icon — commonly 16, 32, 48 and
  256 pixels — each stored either as a PNG or as an old-style Windows bitmap with a transparency mask. Most image editors
  and design tools can't open .ico files directly. This converter extracts the largest image, or every size inside the
  file, as transparent PNGs.


  Both kinds of icon entries are decoded — PNG-compressed ones and classic bitmap ones, including their AND masks — so
  transparency comes out right. It all runs in your browser; favicons and app icons are never uploaded.
useCases:
  - title: "Reusing a website's favicon"
    text: >-
      Turn a favicon.ico into a PNG for a bookmark list, documentation or a link preview.
  - title: "Editing an application icon"
    text: >-
      Extract the 256 px version as a PNG, edit it, then rebuild the icon in your icon tool.
  - title: "Checking what's inside an .ico"
    text: >-
      Export every size to see exactly which resolutions the icon provides.
  - title: "Design assets from legacy software"
    text: >-
      Recover artwork from old Windows programs whose icons are the only surviving copies.
limitations:
  - >-
    Small entries (16 or 32 px) are only as detailed as they were designed to be; they are not upscaled or improved.
  - >-
    Animated cursors (.ani) and .icns (macOS icons) are different formats and are not supported.
  - >-
    Icons with unusual or corrupted entries are skipped with a message; the remaining sizes are still converted.
faq:
  - q: "Which size is converted by default?"
    a: >-
      The largest image in the icon, preferring the higher color depth when two entries have the same size. Choose
      “Every size in the file” in Settings to export all of them.
  - q: "Is transparency preserved?"
    a: >-
      Yes. PNG-type entries keep their alpha channel, and bitmap-type entries have their AND mask applied, so the
      transparent background is correct.
  - q: "How do I get a favicon.ico from a website?"
    a: >-
      Most sites serve it at /favicon.ico — for example https://example.com/favicon.ico. Save it, then drop it here.
  - q: "Can I convert PNG to ICO here?"
    a: >-
      Not yet. This tool extracts images from icons; creating .ico files is planned as a separate converter.
---

## Two kinds of images inside one icon

The ICO format starts with a small directory listing each entry's width, height, color depth, size and offset. Since
Windows Vista, large entries (256 px) are usually stored as complete PNG files. Smaller entries are often stored as a
*DIB* — a device-independent bitmap without the usual BMP file header, whose height field is doubled because the color
image is followed by a 1-bit AND mask marking transparent pixels. This converter decodes both kinds itself rather
than relying on the browser, so results are consistent in every browser.

## Picking the right entry

When you choose “Largest image only”, the converter sorts entries by pixel count and then by color depth. For modern
icons that is the 256 × 256 PNG entry; for old icons it may be 32 × 32 or 48 × 48 — the icon simply doesn't contain
anything bigger.
