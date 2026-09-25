---
intro: >-
  iPhones and iPads have saved photos as HEIC since iOS 11 whenever the camera is set to “High Efficiency”. That keeps
  your camera roll small, but the moment a photo leaves the Apple ecosystem it often stops working: Windows shows a
  blank thumbnail, a web form says “unsupported file type”, a print kiosk refuses it. This tool decodes HEIC images in
  your browser and re-encodes them as standard JPEGs at a quality you choose, so the result opens on every computer,
  phone and website.


  You can convert a whole batch at once and download the JPGs individually or as a single ZIP. Safari 17 and later
  decode HEIC natively; other browsers download a small HEIC decoder the first time you convert. Either way the photos
  are processed on your device and are never uploaded.
useCases:
  - title: "Sharing iPhone photos with Windows or Android users"
    text: >-
      Convert before emailing or messaging so recipients can open the pictures without installing HEIF or HEVC codecs.
  - title: "Uploading to forms that only take JPG"
    text: >-
      Government portals, job applications, school systems and online print shops frequently accept only JPG or PNG.
  - title: "Editing in older software"
    text: >-
      Many photo editors, office suites and design tools released before 2020 cannot import HEIC but read JPG perfectly.
  - title: "Removing location data before posting"
    text: >-
      The JPGs are re-encoded from pixels, so GPS coordinates and other EXIF metadata from the original are not carried over.
limitations:
  - >-
    Live Photos and bursts: only the primary still image of a HEIC file is converted; the motion video and extra
    frames are not included.
  - >-
    HEIC can hold 10-bit, wide-gamut (Display P3) color. JPG is 8-bit and is written in sRGB, so very saturated reds
    and greens can look slightly less vivid.
  - >-
    Depth maps, portrait-mode data and all EXIF metadata (date taken, camera, GPS) are not copied into the JPG. Keep
    the original if you need them.
  - >-
    JPG is lossy. Converting at 90% quality is visually identical for normal viewing, but the JPG is typically
    1.5–2× larger than the HEIC it came from.
  - >-
    Very large photos may be scaled down on iPhones and iPads because Safari limits canvas size to about 16.7
    megapixels; the tool tells you when that happens.
faq:
  - q: "Why can't I open HEIC files on Windows?"
    a: >-
      HEIC images are compressed with HEVC, a patented video codec. Windows only opens them after installing the HEIF
      Image Extensions and the paid HEVC Video Extensions from the Microsoft Store. Converting to JPG avoids needing
      either.
  - q: "Will converting HEIC to JPG reduce quality?"
    a: >-
      Slightly, because JPG is also a lossy format and the picture is compressed a second time. At the default 90%
      quality the difference is not visible at normal viewing sizes. Choose 95–100% if you plan to edit the JPG heavily.
  - q: "Are my photos uploaded anywhere?"
    a: >-
      No. Decoding and encoding happen inside your browser tab. You can disconnect from the internet after the page
      has loaded and the converter will keep working (the HEIC decoder must have been downloaded once).
  - q: "How do I stop my iPhone from taking HEIC photos?"
    a: >-
      Go to Settings → Camera → Formats and choose “Most Compatible”. New photos will be saved as JPG. Alternatively,
      Settings → Photos → Transfer to Mac or PC → Automatic converts photos to JPG when you copy them to a computer.
  - q: "Why is my JPG bigger than the original HEIC?"
    a: >-
      HEVC compression is roughly twice as efficient as JPEG, so the same visual quality needs more bytes as a JPG.
      Lower the quality setting to 80–85% or use the Size option if you need smaller files.
---

## Why HEIC exists — and why JPG is still the safe choice

Apple adopted HEIC for one reason: storage. A 12-megapixel photo that takes about 3–4 MB as a JPEG takes roughly
half that as HEIC, and the format can also hold depth information, 10-bit color and image sequences. Inside Apple's
ecosystem everything handles it transparently — when you AirDrop to a Mac or share to an app that doesn't support
HEIC, iOS often converts the photo to JPG for you.

Outside that ecosystem the picture changes. HEVC, the codec inside HEIC, is covered by several patent pools, so many
vendors don't ship a decoder by default. Chrome and Firefox don't display HEIC at all, Windows needs extra store
extensions, and countless upload forms reject `.heic` outright. JPEG, standardised in 1992, is patent-free in practice
and supported by literally every device that shows images. When a photo has to work everywhere without explanation,
JPG is the interoperable choice.

## Choosing the right quality setting

The quality slider controls how aggressively the JPEG encoder discards detail:

- **90% (default)** — visually indistinguishable from the HEIC for screens and ordinary prints.
- **95–100%** — for photos you will edit again; avoids stacking compression artefacts, at the cost of larger files.
- **75–85%** — for web uploads with size limits; fine detail such as foliage and hair starts to soften.

The **Size** option downsizes images (for example to 1920 px on the longest side) — often the most effective way to
get under an email or form size limit, because a 12 MP phone photo has far more pixels than any screen needs.
