---
intro: >-
  WebVTT captions — including the auto-generated ones you can download from video platforms — are a great source for a
  transcript, but they're full of noise: the WEBVTT header, cue settings, speaker tags, inline karaoke timestamps and,
  in auto-captions, “rolling” cues that repeat the previous line. This converter strips all of that and outputs clean
  text, joined into paragraphs at natural pauses.


  Repeated rolling lines are removed by default, so auto-captions don't come out with every sentence twice. You can
  keep timestamps instead of paragraphs if you need to reference moments in the video. Everything runs in your browser.
useCases:
  - title: "Transcripts from downloaded captions"
    text: >-
      Turn a video's .vtt captions into a readable transcript.
  - title: "Cleaning auto-generated captions"
    text: >-
      Remove the duplicated rolling lines typical of automatic captions.
  - title: "Research and citation"
    text: >-
      Search and quote what was said in talks, lectures and interviews.
  - title: "Input for AI summarisation"
    text: >-
      Give summarisers and chat assistants clean text instead of caption markup.
limitations:
  - >-
    Speaker (voice) tags are removed; speaker names aren't added to the transcript.
  - >-
    Automatic captions often lack punctuation and capitalisation; the converter doesn't add any.
  - >-
    De-duplication removes a line only when it exactly repeats the previous line, so partially overlapping captions may
    still contain some repetition.
  - >-
    Paragraph breaks are based on pauses of two seconds or more, not on meaning.
faq:
  - q: "Why do auto-generated captions repeat lines?"
    a: >-
      Rolling captions show the previous line together with the new one, so each line appears in two consecutive cues.
      With “Remove repeated rolling lines” enabled, each line is kept once.
  - q: "What is removed from the VTT?"
    a: >-
      The WEBVTT header, cue identifiers and timings, cue settings, NOTE/STYLE/REGION blocks, voice and class tags and
      inline timestamps.
  - q: "Can I get timestamps in the output?"
    a: >-
      Yes. Enable “Keep timestamps” to prefix each cue with its start time.
  - q: "Are HTML entities decoded?"
    a: >-
      Yes. &amp;, &lt;, &gt;, &nbsp; and numeric entities are converted to their characters.
---

## Rolling captions and duplicates

Automatic captions are usually displayed as a two-line roll-up: when a new line appears, the old bottom line moves up.
The VTT therefore stores the same line twice — once as the new bottom line, once as the top line of the next cue. A
naive conversion doubles every sentence. The converter tracks the last line it emitted and skips exact repeats, which
collapses roll-up captions into a single clean sequence.

## Cleaning WebVTT markup

WebVTT cues can carry markup that has no meaning in plain text: `<v Speaker>` voice spans, `<c.yellow>` classes,
`<00:00:12.340>` karaoke timestamps, `<ruby>` annotations and HTML entities. All tags are removed, their text content
is kept, and entities are decoded to real characters.
