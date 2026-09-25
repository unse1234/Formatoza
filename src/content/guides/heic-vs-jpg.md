---
title: "HEIC vs JPG: Why iPhone Photos Won't Open"
metaDescription: "Why iPhones save photos as HEIC, why Windows and websites reject them, and the simplest ways to get JPGs — on the phone, on a computer or in the browser."
h1: "HEIC vs JPG: why iPhone photos won't open, and what to do"
summary: "What HEIC is, why Apple uses it, where it breaks, and four reliable ways to end up with JPGs."
category: image
published: 2026-09-25
updated: 2026-09-25
tools: [heic-to-jpg, heic-to-png, heic-to-webp, heic-to-pdf]
---

If you've ever emailed photos from an iPhone to a Windows PC and received blank thumbnails, or tried to upload a picture
to a government form and been told the file type isn't allowed, you've met HEIC. This guide explains what the format
is, why Apple chose it, where it causes trouble, and the simplest ways to get universally compatible JPGs.

## What HEIC actually is

HEIC stands for *High Efficiency Image Container*. It's Apple's use of HEIF, the High Efficiency Image File Format
standardised by MPEG in 2015, with images compressed by HEVC — the H.265 video codec. Think of it as a single,
very well-compressed video frame stored in a container that can also hold extras: several images (bursts), a depth
map for portrait mode, an alpha channel, thumbnails and the usual EXIF metadata.

Apple switched the iPhone camera to HEIC with iOS 11 in 2017 when the camera setting is **High Efficiency**, which is
the default on modern iPhones.

## Why Apple uses it

The reason is storage. HEVC compresses photographs roughly twice as efficiently as JPEG at similar visual quality, so a
typical 12-megapixel photo drops from about 3–4 MB to under 2 MB. Across tens of thousands of photos, that's many
gigabytes of phone storage and iCloud space saved. HEIC also supports 10-bit color, so recent iPhones can capture
wider-gamut (Display P3) color with less banding in skies and gradients.

## Why HEIC breaks outside Apple devices

HEVC is covered by multiple patent pools with licensing fees. As a result:

- **Chrome and Firefox** don't display HEIC images at all. **Safari** does since version 17.
- **Windows** needs the *HEIF Image Extensions* plus the paid *HEVC Video Extensions* from the Microsoft Store.
- **Android** supports HEIF decoding since Android 9 on many devices, but support in apps varies.
- **Websites, portals and print services** frequently accept only JPG and PNG.

JPEG, by contrast, has been universal since the 1990s. Every device, operating system and application that displays
images reads it.

## Four ways to get JPGs

### 1. Change the iPhone camera setting

Settings → Camera → Formats → **Most Compatible**. New photos are saved as JPG (and videos as H.264). You lose HEIC's
storage savings, and existing photos are unchanged.

### 2. Let iOS convert when transferring

Settings → Photos → *Transfer to Mac or PC* → **Automatic**. When you copy photos to a computer over USB, iOS converts
them to JPG. Sharing via AirDrop or some apps also converts automatically when the receiver doesn't support HEIC.

### 3. Export from Photos on a Mac

Select photos, then File → Export → Export *n* Photos, and choose JPEG. You can pick quality and whether to include
location data.

### 4. Convert in the browser

Use the [HEIC to JPG converter](/heic-to-jpg/) on any computer or phone. The photos are decoded and re-encoded inside
your browser and never uploaded. It's the quickest route when the HEIC files are already on a Windows PC, a
Chromebook or in a download folder.

## JPG, PNG, WebP or PDF?

| Target | Choose it when | Converter |
|---|---|---|
| JPG | Sharing, emailing, uploading, printing | [HEIC to JPG](/heic-to-jpg/) |
| PNG | Editing without further loss, cut-outs | [HEIC to PNG](/heic-to-png/) |
| WebP | Publishing on a website | [HEIC to WebP](/heic-to-webp/) |
| PDF | Photos of documents to submit as one file | [HEIC to PDF](/heic-to-pdf/) |

## Quality: does converting hurt?

Both HEIC and JPG are lossy, so converting compresses the image a second time. At a JPG quality of about 90% the
difference isn't visible at normal viewing sizes. The JPG will be larger than the HEIC — typically 1.5 to 2 times —
simply because JPEG is less efficient. Wide-gamut colors are converted to standard sRGB, which can make extremely
saturated colors very slightly less intense.

## Privacy: metadata and location

iPhone photos usually contain EXIF metadata including the date, camera settings and often GPS coordinates. Converters
that re-encode pixels — including the ones on this site — do not copy that metadata into the output, so the JPG won't
reveal where it was taken. If you need to keep the date and location, export from Apple Photos with metadata included
instead.

## Key takeaways

- HEIC is a modern, efficient photo format that's great inside the Apple ecosystem and unreliable outside it.
- For anything leaving your devices, JPG is the safe choice.
- Switch the camera to “Most Compatible” if you never want HEIC, or convert on demand when you need to share.
