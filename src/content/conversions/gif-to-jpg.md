---
intro: >-
  GIF files are either tiny animations or old-style graphics limited to 256 colors. When you need a normal photo-style
  image — a still for a thumbnail, a document, a form that rejects GIF, or a platform that animates GIFs when you want
  a static picture — converting to JPG gives you a universally accepted file.


  For animated GIFs, the first frame is converted and the tool tells you how many frames the file had. Transparent
  pixels are filled with a background color you choose. Conversion happens in your browser, and nothing is uploaded.
useCases:
  - title: "A static thumbnail from an animation"
    text: >-
      Use the first frame of an animated GIF as a preview image or poster.
  - title: "Forms that reject GIF"
    text: >-
      Profile photos, ID uploads and many CMS fields accept JPG but not GIF.
  - title: "Old graphics and scans"
    text: >-
      Legacy websites and early scanners saved images as GIF; JPG is easier to use today.
  - title: "Stopping unwanted animation"
    text: >-
      Some platforms auto-play GIFs; a JPG keeps the image still.
limitations:
  - >-
    Only the first frame of an animated GIF is converted. There is no frame picker in this tool.
  - >-
    GIF's 256-color palette and dithering are preserved as they appear; converting to JPG cannot add color depth that
    wasn't there.
  - >-
    Transparency is replaced by your background color (white by default).
  - >-
    For flat-color GIF graphics, a PNG is often smaller and sharper than a JPG. Use GIF to PNG for logos and diagrams.
faq:
  - q: "Which frame is used for animated GIFs?"
    a: >-
      The first frame. The results panel tells you how many frames the GIF contained.
  - q: "Will converting improve the colors?"
    a: >-
      No. A GIF stores at most 256 colors per frame; the JPG shows exactly those colors. It can't restore the original
      full-color image.
  - q: "Why does my JPG look worse than the GIF?"
    a: >-
      GIF graphics with flat colors and hard edges suit lossless formats. Raise the JPG quality to 95%, or use GIF to PNG
      instead.
  - q: "Can I convert many GIFs at once?"
    a: >-
      Yes, up to 50 files per batch, downloadable individually or as a ZIP.
---

## GIF's 256-color limit

The GIF format dates from 1987, when displays showed a few hundred colors at most. Each frame references a palette of
up to 256 colors, and anything in between is approximated by *dithering* — a pattern of dots that blends visually. That
works for simple graphics and short animations, but photographs saved as GIF look posterised and speckled. Converting
to JPG doesn't undo that; it simply puts the pixels you see into a format with wider support.

## First-frame extraction

An animated GIF is a sequence of frames, each with its own delay and optional transparency. Browsers decode the first
fully composed frame when asked for a still image, and that is what gets converted. If the frame you want is later in
the animation, extract it with a video or GIF editor first.
