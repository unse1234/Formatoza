---
intro: >-
  Icons are designed to sit on transparent backgrounds, but sometimes you need them as ordinary JPG images — for a
  spreadsheet of assets, a document template, a system that only takes JPG, or a thumbnail. This converter extracts the
  image from an .ico file and places it on a solid background color of your choice before encoding it as a JPG.


  By default the largest image in the icon is used; you can also export every size the icon contains. Both PNG-style and
  classic bitmap icon entries are supported, and all processing happens in your browser.
useCases:
  - title: "Asset inventories"
    text: >-
      Build catalogues of application icons in tools that only display JPG thumbnails.
  - title: "Systems that only accept JPG"
    text: >-
      Some CMS fields, ticketing systems and databases accept only JPEG images.
  - title: "Icons on a brand background"
    text: >-
      Place an icon on your brand color to use it as a square tile or placeholder image.
  - title: "Quick previews"
    text: >-
      Produce lightweight previews of icons for documentation or email.
limitations:
  - >-
    JPG has no transparency; the transparent background becomes your chosen color, and soft edges blend into it.
  - >-
    JPEG compression can blur tiny icons; use 95–100% quality, or convert ICO to PNG for pixel-exact output.
  - >-
    Small icon sizes are not upscaled or enhanced. Pick the largest available size for the best result.
faq:
  - q: "Which background color should I use?"
    a: >-
      The color of the page or document where the JPG will appear — white by default. Semi-transparent edges blend with
      it, so a mismatched color can leave a visible halo.
  - q: "Can I export all icon sizes?"
    a: >-
      Yes. Choose “Every size in the file” in Settings; each size is saved as its own JPG with the dimensions in the file
      name.
  - q: "Why does my JPG look blurry?"
    a: >-
      Tiny icons have very few pixels, and JPEG compression affects them visibly. Use the highest quality, or ICO to PNG.
  - q: "Is anything uploaded?"
    a: >-
      No, icons are decoded and converted locally in your browser.
---

## Flattening an icon correctly

Icon artwork relies on partial transparency for anti-aliased edges and drop shadows. Flattening composites every
pixel onto the background color using its alpha value: a pixel that is 40% opaque black on a white background becomes
a light gray. That is exactly how the icon would look on that background in any app, so choosing the right color gives
a seamless result.

## When JPG is a poor fit

JPEG's 8×8 block compression is designed for photographs. A 32 × 32 icon is only 16 such blocks, and hard-edged pixel
art shows compression noise easily. If the destination accepts PNG, use ICO to PNG instead; if it must be JPG, keep
quality at 95% or above.
