---
intro: >-
  WebP became the web's default image format quietly: CDNs and CMSs convert uploads to WebP automatically, so when you
  save a picture from a website you increasingly get a .webp file. It displays fine in the browser, but older photo
  editors, some versions of Microsoft Office, print services and plenty of upload forms won't take it. Converting to
  JPG solves that in one step.


  This converter decodes WebP with your browser, encodes a JPG at the quality you choose, and fills any transparent
  areas with a background color. Convert one image or a batch of 50; nothing is uploaded, and your files never leave
  your device.
useCases:
  - title: "Using web images in documents"
    text: >-
      Insert pictures saved from websites into Word, PowerPoint or PDF tools that don't recognise WebP.
  - title: "Editing in older software"
    text: >-
      Photoshop only gained native WebP support in version 23.2 (2022); many other editors still lack it.
  - title: "Uploading to picky forms"
    text: >-
      Job boards, government sites, marketplaces and dating apps often allow only JPG or PNG uploads.
  - title: "Printing"
    text: >-
      Photo labs, print kiosks and many home printer apps expect JPG files.
limitations:
  - >-
    Transparent areas are replaced by the background color you choose, because JPG has no transparency. Use WebP to PNG
    to keep transparency.
  - >-
    Animated WebP files are converted to a single still image of the first frame.
  - >-
    Both formats are lossy, so the image is compressed one more time; at 90% quality the change is not visible in
    normal use.
  - >-
    The JPG will usually be larger than the WebP — often by 25–35% — because WebP compresses more efficiently.
faq:
  - q: "Why do images I save from websites end up as WebP?"
    a: >-
      Many sites serve WebP to browsers that support it because the files are smaller and pages load faster. The
      address may even end in .jpg while the actual data is WebP; this tool detects the real format from the file's
      bytes.
  - q: "Does WebP to JPG lose quality?"
    a: >-
      Minimally at the default 90% quality. You can raise it to 95–100% if you plan to edit and re-save the JPG several
      times.
  - q: "What background color is used for transparent WebPs?"
    a: >-
      White by default. Change it in Settings to black or any color that suits where the image will be placed.
  - q: "Can I convert WebP to JPG on an iPhone?"
    a: >-
      Yes. Open this page in Safari, tap “Choose files”, pick the images from Photos or Files, then download the JPGs.
---

## When a “.jpg” is actually WebP

A surprisingly common problem: you download `photo.jpg`, but your editor refuses to open it. The server sent WebP
data under a .jpg name because your browser advertised WebP support. File extensions are only labels; what matters is
the first bytes of the file — a WebP starts with `RIFF….WEBP`, a JPEG with `FF D8 FF`. This converter checks those
bytes, tells you when a file isn't what its name claims, and decodes it correctly either way.

## WebP vs JPG for sharing

WebP is the better format for serving images on a website you control. For images you hand to other people or other
software, JPG is still safer: it's been universal for three decades, every device decodes it in hardware or software,
and nobody will ever ask you what a .jpg is. Convert to JPG when the destination is out of your hands, and keep the
WebP when it's going back on the web.
