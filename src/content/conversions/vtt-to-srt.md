---
intro: >-
  WebVTT is the caption format of the web — it's what you get when you download captions from many video sites, course
  platforms and streaming tools. But video editors (Premiere Pro, DaVinci Resolve, Final Cut Pro), desktop players and
  most upload forms work best with SRT. This converter turns WebVTT into clean, numbered SRT with comma timestamps and
  Windows line endings.


  NOTE comments, STYLE and REGION blocks are skipped, cue settings are dropped (a top-positioned cue becomes {\an8}),
  and speaker tags are removed while keeping the spoken text. Everything happens in your browser.
useCases:
  - title: "Importing into video editors"
    text: >-
      Premiere Pro, DaVinci Resolve and Final Cut workflows handle SRT reliably.
  - title: "Uploading to platforms"
    text: >-
      Social platforms and many video hosts accept SRT captions for uploads.
  - title: "Offline playback"
    text: >-
      VLC, MPC and TV media players support SRT everywhere.
  - title: "Translation workflows"
    text: >-
      Subtitle translators and CAT tools commonly exchange SRT files.
limitations:
  - >-
    WebVTT styling (CSS ::cue, classes), regions and most cue settings (position, size, alignment) have no SRT
    equivalent and are removed.
  - >-
    Speaker names in <v> voice tags are dropped; only the spoken text remains.
  - >-
    Inline karaoke timestamps and ruby annotations are flattened to plain text.
  - >-
    NOTE comments are not carried over.
faq:
  - q: "What happens to WebVTT styling and positions?"
    a: >-
      SRT can't express them, so they're removed. The only exception is cues placed at the top of the screen, which are
      marked with {\an8}, a tag many players understand.
  - q: "Will speaker names be kept?"
    a: >-
      Voice tags like <v Sam> are removed; the text inside is kept. Add speaker names to the text first if you need them.
  - q: "Does it handle YouTube auto-generated captions?"
    a: >-
      Yes, but auto-captions repeat lines in overlapping cues. The SRT will contain those repetitions; use VTT to TXT
      for a clean transcript.
  - q: "Which encoding does the SRT use?"
    a: >-
      UTF-8, with Windows (CRLF) line endings for maximum compatibility with players and editors.
---

## What changes between WebVTT and SRT

- `WEBVTT` header and any metadata lines → removed
- `00:01:02.500` → `00:01:02,500`, always with hours
- cue identifiers → replaced by sequential numbers starting at 1
- cue settings (`line:0 position:50% align:center`) → removed, except top placement → `{\an8}`
- `<b>`, `<i>`, `<u>` → kept
- `<v Speaker>`, `<c.class>`, `<lang>`, `<ruby>` → removed, text kept
- `&amp;`, `&lt;`, `&gt;` and other entities → decoded to real characters

## Why SRT is still the lingua franca

SRT has no formal specification, which sounds like a weakness but means almost every tool supports the simple core
everyone agrees on: numbered cues, comma timestamps, a few formatting tags. When captions have to work in an editor, a
TV and three upload forms, SRT is the least risky choice.
