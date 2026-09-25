---
intro: >-
  Some platforms accept only JPG — certain marketplaces, ad networks, print shops, email marketing tools and CMS
  fields — and some older systems don't handle PNG transparency well either. Converting an SVG to JPG renders the vector
  drawing at the size you choose and places it on a solid background color, producing an image any system will accept.


  The SVG is re-drawn at the target resolution rather than stretched, so edges stay sharp. Choose the background color
  that replaces transparency, set the JPEG quality, and convert files or pasted SVG code — all locally in your browser.
useCases:
  - title: "Marketplaces and ad platforms"
    text: >-
      Listings and ad creatives often require JPG with a white background.
  - title: "Print orders"
    text: >-
      Print services commonly accept JPG; render at 4× or a large custom width for print resolution.
  - title: "Email newsletters"
    text: >-
      Email clients don't render SVG; a JPG or PNG is required, and JPG keeps files small for photos-heavy designs.
  - title: "Thumbnails and previews"
    text: >-
      Generate a quick, compact preview image of an illustration or chart.
limitations:
  - >-
    JPG has no transparency; transparent areas are filled with your background color and soft edges blend into it.
  - >-
    JPEG compression can make thin lines and small text slightly fuzzy. Use 90–100% quality for line art, or choose SVG
    to PNG for pixel-perfect edges.
  - >-
    External images and web fonts referenced by the SVG are not loaded, and scripts or animations are not executed.
  - >-
    Text uses fonts installed on your device; outline text in your design tool for exact typography.
faq:
  - q: "Should I convert SVG to JPG or PNG?"
    a: >-
      PNG if you need transparency or pixel-sharp line art; JPG if the destination requires it or the SVG is
      photo-like (gradients, embedded photos) and file size matters.
  - q: "How do I get a white background?"
    a: >-
      White is the default. Open Settings to pick any other color for the areas the SVG leaves transparent.
  - q: "How large can the output be?"
    a: >-
      Up to 8192 px wide with the custom width option; browsers limit canvas size, and iPhones and iPads cap it around
      16.7 megapixels, so very large renders may be reduced automatically.
  - q: "Is the SVG uploaded to a server?"
    a: >-
      No. It's rendered by your browser inside this page, and scripts inside the SVG never run.
---

## Line art and JPEG don't mix — use high quality

JPEG's block-based compression is tuned for photographs. Vector artwork tends to be the opposite: large flat areas
and hard edges. At moderate quality settings you'll see faint noise (“mosquito” artefacts) around lines and text. For
logos and diagrams, set quality to 95% or higher; the file stays small anyway because flat areas compress well. For
illustrations with gradients and textures, 85–90% is usually indistinguishable.

## Picking a render size

Think in terms of the final display size. For a JPG shown at 600 px wide, render at 1200 px (2×) to look crisp on
high-density screens. For print, multiply the print width in inches by 300: a 4-inch-wide logo needs about 1200 px.
