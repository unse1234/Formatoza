---
intro: >-
  Base64 strings turn up everywhere: in logs, API payloads, email sources, configuration files, JWTs and data URLs.
  This decoder turns them back into readable text, decoding the bytes as UTF-8 so accented letters and emoji come out
  correctly. It's tolerant of the variations you meet in practice: line breaks and spaces, the URL-safe alphabet (- and
  _), and missing = padding are all handled and reported.


  If the decoded bytes aren't text — say, a PNG image or a PDF someone embedded as Base64 — the tool recognises the file
  type from its signature and offers it as a download instead of showing gibberish. Everything happens in your browser.
useCases:
  - title: "Reading encoded log and API values"
    text: >-
      Decode Base64 fields in logs, webhooks and API responses while debugging.
  - title: "Inspecting Kubernetes Secrets"
    text: >-
      Decode values from kubectl get secret -o yaml to check their contents.
  - title: "Recovering embedded files"
    text: >-
      Turn a Base64 blob or data: URL back into the image or document it contains.
  - title: "Reading email sources"
    text: >-
      Decode Base64-encoded MIME parts from raw email.
limitations:
  - >-
    Text is decoded as UTF-8. Base64 that encodes UTF-16 or legacy encodings will show incorrect characters.
  - >-
    Invalid characters stop decoding with an error showing their position; the decoder doesn't guess.
  - >-
    File-type detection covers common formats (images, PDF, ZIP/Office); other binary data is offered as a .bin file.
faq:
  - q: "What if my Base64 has line breaks?"
    a: >-
      Whitespace and line breaks are ignored, so MIME-wrapped Base64 decodes directly.
  - q: "Does it support URL-safe Base64?"
    a: >-
      Yes. Strings using - and _ are detected automatically, and missing = padding is added.
  - q: "Why do I get a download instead of text?"
    a: >-
      Because the decoded bytes aren't valid text. The tool checks their signature — for example a PNG header — and offers
      the file with the right extension.
  - q: "Can I decode a data: URL?"
    a: >-
      Yes. Paste the whole data:…;base64,… string; the prefix is removed and its MIME type is used for the download.
---

## Is it text or a file?

Base64 can hold any bytes. After decoding, the tool tries to read the bytes as UTF-8. If they aren't valid UTF-8, or
are full of control characters, the data is binary. Many binary formats begin with a recognisable *magic number* —
`89 50 4E 47` for PNG, `25 50 44 46` (“%PDF”) for PDF, `50 4B` for ZIP-based formats such as DOCX and XLSX — so the
decoder names the file type and lets you download it rather than printing unreadable characters.

## Common reasons decoding fails

- **Truncated data** — a Base64 string whose length leaves a single dangling character can't represent whole bytes.
- **Foreign characters** — quotes, commas or a “Bearer ” prefix copied along with the value.
- **Double encoding** — if the result is itself Base64, decode it again.
