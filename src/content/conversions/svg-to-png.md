---
intro: >-
  SVG is the ideal format for logos and icons on the web because it describes shapes instead of pixels and stays sharp
  at any size. But many destinations can't use it: social networks, app stores, marketplaces, Office documents, email
  signatures and chat apps generally want PNG. Converting means rendering the vector drawing at a specific pixel size —
  and doing it at the right size is what keeps the result crisp.


  This converter redraws the SVG at 1×, 2×, 4× or a custom width before rasterising, so edges stay sharp instead of being
  upscaled from a small bitmap. Transparent areas remain transparent in the PNG. You can drop .svg files or paste SVG
  code, and it all happens in your browser.
useCases:
  - title: "Logos for social media and app stores"
    text: >-
      Profile pictures, store listings and ad platforms require PNG or JPG uploads.
  - title: "Icons for documents and slides"
    text: >-
      PowerPoint, Word and Google Slides handle PNG reliably; SVG support varies by version.
  - title: "Retina-ready assets"
    text: >-
      Export at 2× or 4× for crisp display on high-density screens.
  - title: "Favicons and app icons"
    text: >-
      Generate large PNG masters from an SVG, then feed them to icon generators.
limitations:
  - >-
    For security, the SVG is rendered as an image: scripts don't run and external files (linked images, web fonts,
    CSS imports) are not loaded, so anything depending on them will be missing.
  - >-
    Text inside the SVG is drawn with fonts installed on your device. If the SVG relies on a font you don't have, a
    fallback font is used. Convert text to outlines in your design tool for exact results.
  - >-
    Animations (SMIL or CSS) are not captured; you get a single static frame.
  - >-
    SVGs with no width, height or viewBox are rendered at the browser default of 300 × 150; use a custom width if the
    result looks wrong.
faq:
  - q: "What resolution should I export an SVG at?"
    a: >-
      Use the size at which the PNG will be displayed, multiplied by 2 for high-density screens. For a 200 px logo on a
      website, export at 400 px wide. The default is 2×.
  - q: "Will the PNG have a transparent background?"
    a: >-
      Yes. Anything the SVG doesn't paint stays transparent. If your SVG has a background rectangle, that will be
      rendered.
  - q: "Why is my text in the wrong font?"
    a: >-
      SVG text is rendered with fonts available on your device, and web fonts referenced by the SVG are not fetched.
      Convert text to paths (“Create outlines” in Illustrator, “Object to path” in Inkscape) before exporting.
  - q: "Can I paste SVG code instead of uploading a file?"
    a: >-
      Yes. Switch to “Paste text”, paste the markup that starts with <svg, and the PNG is generated as you type.
---

## Rasterising vectors without blur

An SVG has no pixel size of its own — only a coordinate system (the `viewBox`) and optional `width`/`height`
attributes. A naive converter renders at that nominal size and then stretches the bitmap, which blurs every edge.
This tool instead rewrites the SVG's `width` and `height` to the target size and lets the browser's vector renderer
draw the shapes directly at that resolution. A 24 × 24 icon exported at 4× is drawn at 96 × 96, with every curve
calculated at full precision.

## Why external resources are blocked

SVG is XML and can reference other files and even contain JavaScript. Rendering an untrusted SVG as a full document
could run that script. Browsers treat SVGs loaded as images much more strictly — no scripts, no network requests —
and this converter relies on that sandbox. The trade-off is that SVGs pulling in external images or web fonts render
without them.
