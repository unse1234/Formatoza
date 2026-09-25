---
intro: >-
  The HTML5 <track> element only plays WebVTT captions, and many web video players, course platforms and streaming
  tools expect .vtt files too — while most subtitle editors, downloads and translation services deliver SRT. The two
  formats look almost identical, but the details matter: WebVTT needs a WEBVTT header, uses a dot instead of a comma
  before the milliseconds, and escapes characters that SRT leaves raw.


  This converter parses SRT tolerantly (missing counters, Windows line endings, legacy encodings, stray tags), writes
  valid WebVTT, keeps italic, bold and underline, and can shift all timings if your captions are out of sync. Files are
  processed in your browser.
useCases:
  - title: "Captions for HTML5 video"
    text: >-
      Add subtitles to a <video> element with <track kind="subtitles" src="captions.vtt">.
  - title: "Course and video platforms"
    text: >-
      Many LMS platforms and web players (Video.js, Plyr, JW Player) prefer or require WebVTT uploads.
  - title: "Fixing sync issues"
    text: >-
      Shift every cue earlier or later while converting when captions drift from the audio.
  - title: "Accessibility compliance"
    text: >-
      Provide captions in the web-standard format expected by accessibility audits.
limitations:
  - >-
    SRT <font color> tags have no WebVTT equivalent and are removed (WebVTT styles colors with CSS ::cue classes instead).
  - >-
    SRT has almost no positioning. A leading {\an8} tag is converted to a top-of-screen cue setting; other ASS-style
    tags inside SRT are removed.
  - >-
    Cues are sorted by start time; cues ending before they start are repaired and reported.
  - >-
    No WebVTT styling, regions or speaker (voice) tags are generated — SRT has nothing to derive them from.
faq:
  - q: "What's the difference between SRT and VTT?"
    a: >-
      Mainly the header and timestamps. WebVTT files start with “WEBVTT”, use 00:01:02.500 (dot) instead of 00:01:02,500
      (comma), make cue numbers optional, and support cue settings, CSS styling and speaker tags.
  - q: "Can I just rename .srt to .vtt?"
    a: >-
      No. Browsers reject files without the WEBVTT header and with comma timestamps. The text also needs &, < and >
      escaped. Converting handles all of that.
  - q: "My subtitles show strange characters like Ã©. Can this fix them?"
    a: >-
      Usually, yes. Files that aren't valid UTF-8 are read as Windows-1252, the most common legacy encoding, and the VTT
      is written in UTF-8.
  - q: "How do I shift subtitles that are out of sync?"
    a: >-
      Enter a value in “Shift all timings”: positive milliseconds delay the captions, negative values show them earlier.
---

## Timestamp format differences

```
SRT                                   WebVTT
1                                     WEBVTT
00:00:01,000 --> 00:00:03,500
Hello!                                00:00:01.000 --> 00:00:03.500
                                      Hello!
```

WebVTT requires the file signature `WEBVTT` on the first line, uses a full stop before the milliseconds, allows the
hours to be omitted (`01:02.500`) and treats the cue number as an optional identifier. The converter writes
full `HH:MM:SS.mmm` timestamps, which every player accepts.

## Caption compatibility

Browsers are strict about WebVTT: a missing header or a comma in a timestamp means the track silently fails to load.
Browsers also parse cue text as a small markup language, so a literal `<` or `&` must be escaped (`&lt;`, `&amp;`), and
a blank line inside a cue ends it early. The output handles those cases so the track loads in Chrome, Firefox, Safari
and Edge.
