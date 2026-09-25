---
intro: >-
  An SRT file already contains the full dialogue of a video, just chopped into numbered, timed fragments. Converting it
  to plain text gives you a readable transcript: counters and timestamps removed, formatting tags stripped, and short
  subtitle lines joined into flowing paragraphs. Paragraph breaks are placed where there's a pause of two seconds or
  more, or where a new speaker starts with a dash.


  Prefer the timings? Keep a [mm:ss] timestamp in front of each line instead. Files are read in UTF-8 or Windows-1252
  and processed entirely in your browser.
useCases:
  - title: "Transcripts for articles and show notes"
    text: >-
      Turn subtitles into a transcript you can edit into a blog post or podcast notes.
  - title: "Studying and note-taking"
    text: >-
      Read a lecture or documentary as text, search it and highlight it.
  - title: "Summaries with AI tools"
    text: >-
      Feed a clean transcript to a summariser or language model without subtitle noise.
  - title: "Accessibility"
    text: >-
      Offer a text transcript alongside a video for people who prefer reading.
limitations:
  - >-
    Speaker names are only present if the subtitles contain them; the converter can't identify speakers.
  - >-
    Paragraph breaks are a heuristic (pauses and dialogue dashes), not a true understanding of the content.
  - >-
    Sound descriptions like [MUSIC] or (laughs) are kept as text.
  - >-
    All formatting — italics, colors, positions — is removed.
faq:
  - q: "How are paragraphs created?"
    a: >-
      Consecutive subtitle lines are joined with spaces. A new paragraph starts after a pause of at least two seconds or
      when a line starts with a dash (-), which subtitles use for a change of speaker.
  - q: "Can I keep the timestamps?"
    a: >-
      Yes. Enable “Keep timestamps” to get one line per subtitle, prefixed with its start time like [01:23].
  - q: "What about multiple files?"
    a: >-
      Add up to 50 SRT files; each becomes its own text file, downloadable together as a ZIP.
  - q: "Will accented characters come out right?"
    a: >-
      Yes. Files that aren't UTF-8 are read as Windows-1252, and the output is always UTF-8.
---

## From subtitle fragments to readable prose

Subtitles are optimised for reading on screen: two short lines at a time, broken wherever they fit, often mid-sentence.
Printed one after another, they look choppy. The converter strips each cue down to text, joins its lines, and then
joins consecutive cues into paragraphs, using the gaps between cues as natural paragraph boundaries — conversation
flows as one block, and a scene change or long pause starts a new one.

## Timestamps for reference

With “Keep timestamps” on, every cue becomes one line such as `[12:04] You know exactly what.` That's useful for
quoting, citing moments in a video or building a chapter list. Hours are added automatically for long videos.
