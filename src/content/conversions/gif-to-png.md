---
intro: >-
  GIF and PNG are both lossless, but PNG is the more capable format: it supports millions of colors, smooth 8-bit
  transparency and better compression for most graphics. Converting a GIF to PNG gives you an image that every editor
  handles well, keeps its transparent pixels, and is often smaller.


  Animated GIFs are converted to a still image of their first frame. The conversion is lossless — every pixel appears
  exactly as in the GIF — and runs entirely in your browser without uploading anything.
useCases:
  - title: "Editing old web graphics"
    text: >-
      Convert GIF buttons, banners and clip art to PNG before editing so you're not limited to 256 colors.
  - title: "Transparent icons"
    text: >-
      GIF transparency is on/off only; as PNG you can later add soft edges or shadows in an editor.
  - title: "Extracting a still from an animation"
    text: >-
      Save the first frame of a GIF as a clean PNG for documentation or a thumbnail.
  - title: "Modernising an asset library"
    text: >-
      Replace legacy GIF assets with PNG files that current tools and pipelines expect.
limitations:
  - >-
    Only the first frame of an animated GIF is converted.
  - >-
    The PNG shows the same colors as the GIF; converting doesn't add detail or color depth that was lost when the GIF
    was created.
  - >-
    GIF transparency is binary (fully transparent or opaque), so edges remain hard in the PNG until edited.
faq:
  - q: "Is GIF to PNG lossless?"
    a: >-
      Yes. Both formats are lossless, and every pixel of the frame is written unchanged to the PNG.
  - q: "Will transparency be kept?"
    a: >-
      Yes. Transparent GIF pixels become fully transparent PNG pixels.
  - q: "Will the PNG be smaller than the GIF?"
    a: >-
      Often, because PNG's DEFLATE compression usually beats GIF's LZW. For tiny images the difference is negligible.
  - q: "Can I keep the animation?"
    a: >-
      Not with this tool: PNG output here is a single frame. Animated formats need a dedicated GIF or video tool.
---

## LZW versus DEFLATE

GIF compresses pixel data with LZW, an algorithm that was famously patented by Unisys in the 1990s — the licensing
dispute is the reason PNG was created in 1996. PNG uses DEFLATE (the algorithm inside ZIP) and adds per-row prediction
filters, which usually shrink graphics further. Today both are patent-free, but PNG remains the better container for
still images: full 24-bit color, 16-bit channels and a real alpha channel.

## What happens to transparency

In a GIF, one palette entry can be marked as transparent; a pixel is either fully see-through or fully opaque. In the
PNG, those pixels get an alpha value of 0 and everything else 255. The image looks identical, but because PNG supports
256 levels of transparency, you can now soften edges or add shadows in any editor.
