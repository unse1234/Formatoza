---
title: "SRT vs VTT vs ASS: Subtitle Formats Explained"
metaDescription: "The differences between SRT, WebVTT and ASS subtitles — timestamps, styling, positioning and player support — and what is lost when converting between them."
h1: "SRT, VTT and ASS subtitle formats explained"
summary: "How the three main subtitle formats differ, which players and platforms need which, and what each conversion keeps."
category: subtitle
published: 2026-09-25
updated: 2026-09-25
tools: [srt-to-vtt, vtt-to-srt, srt-to-ass, ass-to-srt, srt-to-txt, vtt-to-txt]
---

Three text-based subtitle formats cover almost every situation: **SRT** for compatibility, **WebVTT** for the web, and
**ASS** for styled, typeset subtitles. They all store the same basic thing — text shown between two timestamps — but
differ in syntax, styling and where they work.

## The three formats side by side

**SRT (SubRip)**

```
1
00:00:01,000 --> 00:00:03,500
<i>Previously…</i>
```

**WebVTT**

```
WEBVTT

00:00:01.000 --> 00:00:03.500 line:0
<v Narrator>Previously…
```

**ASS (Advanced SubStation Alpha)**

```
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\i1}Previously…{\i0}
```

| | SRT | WebVTT | ASS |
|---|---|---|---|
| Timestamp | `00:01:02,500` | `00:01:02.500` (hours optional) | `0:01:02.50` |
| Precision | milliseconds | milliseconds | centiseconds |
| Header | none | `WEBVTT` required | `[Script Info]` sections |
| Styling | `<i> <b> <u> <font>` | tags + CSS `::cue` | named styles + override tags |
| Positioning | none (some players read `{\an8}`) | cue settings | absolute positions, movement |
| Plays in | nearly everything | browsers, web players | VLC, mpv, MPC-HC, Aegisub |

## Which one do you need?

- **HTML5 video** — WebVTT is required by the `<track>` element. Use [SRT to VTT](/srt-to-vtt/).
- **Video editors, TVs, upload forms** — SRT is the safest choice. Use [VTT to SRT](/vtt-to-srt/) or
  [ASS to SRT](/ass-to-srt/).
- **Styled subtitles, karaoke, typesetting, burning in with FFmpeg** — ASS. Start with [SRT to ASS](/srt-to-ass/) and
  style in Aegisub.
- **A readable transcript** — plain text: [SRT to TXT](/srt-to-txt/) or [VTT to TXT](/vtt-to-txt/).

## What each conversion loses

Converting *up* to a richer format (SRT → VTT, SRT → ASS) loses nothing, but doesn't invent styling either: you get the
same text with a default look. Converting *down* loses whatever the simpler format can't express:

- **VTT → SRT:** CSS styling, regions, positions (except a top-placement hint), speaker tags, karaoke timestamps.
- **ASS → SRT:** styles, fonts, colors, outlines, positions, fades, karaoke effects and vector drawings. Italic, bold
  and underline survive.
- **Anything → TXT:** timing (unless you keep timestamps) and all formatting.

## Common problems and fixes

### Garbled characters (Ã©, â€™)

The file was saved in a legacy encoding such as Windows-1252 and is being read as UTF-8, or vice versa. Good converters
detect invalid UTF-8 and fall back to Windows-1252, then write UTF-8. All the subtitle converters here do.

### Subtitles out of sync

If every line is early or late by the same amount, shift all timings by a fixed offset — the converters on this site
include a “Shift all timings” setting. If the drift grows over time, the subtitles were made for a different frame rate
or cut, and need a proper retiming tool.

### VTT file won't load in the browser

Check for a missing `WEBVTT` header, commas instead of dots in timestamps, an unescaped `<` or `&` in the text, or a
blank line inside a cue. Converting from SRT with a proper tool avoids all four.

### Auto-generated captions repeat every line

Roll-up captions store each line twice across consecutive cues. When extracting a transcript, remove exact repeated
lines — [VTT to TXT](/vtt-to-txt/) does this by default.

## Frame rates and precision

SRT and WebVTT store milliseconds; ASS stores hundredths of a second. Converting to ASS rounds to the nearest 10 ms,
which is well below a single frame at 24–60 fps and not visible to viewers.
