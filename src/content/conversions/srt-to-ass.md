---
intro: >-
  Advanced SubStation Alpha (.ass) is the format for styled subtitles: named styles with fonts, colors, outlines and
  shadows, precise positioning, fades and karaoke effects. It's what Aegisub and fansub workflows use, and players like
  mpv, VLC and MPC-HC render it faithfully. Converting SRT to ASS gives you a proper script with a configurable Default
  style, ready for styling and typesetting in Aegisub or burning into video with FFmpeg.


  Choose the font, size and script resolution; italic, bold and underline are converted to ASS override tags, line
  breaks to \N, and top-positioned cues to {\an8}. Timings can be shifted during conversion. Everything runs locally.
useCases:
  - title: "Styling in Aegisub"
    text: >-
      Start from an ASS script with a sensible Default style instead of importing raw SRT.
  - title: "Burning subtitles into video"
    text: >-
      FFmpeg's subtitles/ass filter renders ASS styles exactly, e.g. ffmpeg -i in.mp4 -vf ass=subs.ass out.mp4.
  - title: "Consistent fonts across players"
    text: >-
      Set a font and size once in the style instead of relying on each player's defaults.
  - title: "Fansubbing and typesetting"
    text: >-
      Convert translated SRT dialogue into ASS for typesetting signs and effects.
limitations:
  - >-
    Only one style (Default) is created; the converter doesn't infer speakers, signs or songs.
  - >-
    SRT <font color> tags are not converted to ASS color overrides.
  - >-
    ASS stores time in centiseconds, so millisecond timings are rounded to the nearest 10 ms.
  - >-
    Curly braces in the text are replaced with parentheses because { } start ASS override blocks.
faq:
  - q: "What does PlayRes do?"
    a: >-
      PlayResX/PlayResY define the coordinate system of the script. Font sizes, margins and positions are measured in
      that space and scaled to the video. Matching your video's resolution makes values intuitive.
  - q: "What font size should I use?"
    a: >-
      About 5% of the script height is typical: 54–60 for 1080p, 36–40 for 720p. The default is 56 at 1920 × 1080.
  - q: "Are italics kept?"
    a: >-
      Yes. <i>, <b> and <u> become {\i1}…{\i0}, {\b1}…{\b0} and {\u1}…{\u0}.
  - q: "Will the font be embedded?"
    a: >-
      No. The script names the font; the player uses it if installed. For burning in with FFmpeg, make sure the font is
      available on that system.
---

## Anatomy of the generated script

The output has the three standard sections:

- **[Script Info]** — `ScriptType: v4.00+`, `PlayResX`/`PlayResY` and `ScaledBorderAndShadow: yes` so outlines scale
  with the video.
- **[V4+ Styles]** — one `Default` style: your font and size, white text, black outline (scaled to the font size), a
  soft shadow, bottom-centre alignment and margins proportional to the resolution.
- **[Events]** — one `Dialogue:` line per SRT cue, with times in `H:MM:SS.cc`.

## From HTML-like tags to override tags

SRT borrows HTML syntax for formatting; ASS uses override blocks in braces. `<i>Hello</i>` becomes `{\i1}Hello{\i0}`,
line breaks become the hard break `\N`, and a cue marked with SRT's `{\an8}` convention keeps its top-of-screen
placement. Because a literal `{` would start an override block, braces in dialogue are replaced with parentheses.
