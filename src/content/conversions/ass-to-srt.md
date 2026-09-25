---
intro: >-
  ASS/SSA subtitles look great in mpv or VLC, but most other destinations — TVs, phones, video editors, streaming
  uploads, translation tools — need plain SRT. Converting means stripping styles, positioning and effects while keeping
  the dialogue and its timing. This converter reads the [Events] section using the file's own Format line, handles
  commas inside dialogue text correctly, and converts override tags carefully.


  Italic, bold and underline survive as <i>, <b> and <u>; \N becomes a real line break; positioning, colors, fonts,
  karaoke and vector drawings are removed and reported. Commented lines are skipped. It all runs in your browser.
useCases:
  - title: "Playback on TVs and devices"
    text: >-
      Smart TVs, consoles and phones often ignore or mis-render ASS but play SRT.
  - title: "Uploading to video platforms"
    text: >-
      Upload forms generally accept SRT and VTT, not ASS.
  - title: "Editing in NLEs"
    text: >-
      Import dialogue into Premiere Pro, Resolve or Final Cut via SRT.
  - title: "Translation and review"
    text: >-
      Translators and QC tools work with plain SRT text.
limitations:
  - >-
    All styling is lost: fonts, colors, outlines, positions, rotations, fades and karaoke effects.
  - >-
    Signs and typesetting lines become ordinary subtitles, which can clutter the result if the script has many of them.
  - >-
    Vector drawings ({\p1} blocks) are removed entirely.
  - >-
    Timings are converted from centiseconds, so they remain accurate to 10 ms.
faq:
  - q: "Will italics survive?"
    a: >-
      Yes. {\i1} and {\i0} become <i> and </i>; bold and underline are converted the same way.
  - q: "What about signs and song lyrics?"
    a: >-
      Every Dialogue line becomes an SRT cue, including signs and karaoke lines — SRT has no styles to separate them.
      Remove unwanted styles in Aegisub first if needed.
  - q: "Does it support older SSA files?"
    a: >-
      Yes. SSA (v4) and ASS (v4+) share the [Events] structure, and the Format line is read to find the Start, End and
      Text fields.
  - q: "What happens to commented lines?"
    a: >-
      Lines starting with “Comment:” are skipped and counted in the results.
---

## Reading the [Events] section correctly

Each `Dialogue:` line is a comma-separated list whose field order is declared by the `Format:` line —
`Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text` in most files. The Text field comes last and
may itself contain commas, so the parser splits only as many fields as the Format line declares and keeps the rest as
dialogue. That's why sentences with commas stay intact.

## Override tags, decoded

| ASS | SRT |
|---|---|
| `{\i1}text{\i0}` | `<i>text</i>` |
| `{\b1}`, `{\b700}` | `<b>` |
| `\N`, `\n` | line break |
| `\h` | non-breaking space |
| `{\pos(…)}`, `{\an…}`, `{\c&H…&}`, `{\fad(…)}`, `{\k…}` | removed |
