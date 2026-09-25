---
intro: >-
  Percent-encoded text is unreadable: search queries, tracking links, redirect parameters and log entries full of %20,
  %3A and %C3%A9. This decoder turns them back into plain text, decoding %XX sequences as UTF-8 so accented letters,
  CJK characters and emoji come out correctly. It treats + as a space by default, as HTML forms do, and can decode
  repeatedly for links that were encoded twice (%2520).


  Malformed sequences don't stop the decoder: a lone % or an invalid byte sequence is handled gracefully and reported,
  instead of throwing an error like decodeURIComponent does. Everything runs in your browser.
useCases:
  - title: "Reading tracking and redirect links"
    text: >-
      See where a long marketing or login redirect link actually points.
  - title: "Debugging query strings"
    text: >-
      Inspect encoded parameters in server logs, analytics exports or browser dev tools.
  - title: "Fixing double-encoded URLs"
    text: >-
      Turn %2520-style links back into readable, correctly encoded ones.
  - title: "Cleaning exported data"
    text: >-
      Decode URL-encoded fields in CSV exports and database dumps.
limitations:
  - >-
    Decoding + as a space is correct for form-encoded query strings but wrong for URL paths where + is a literal plus;
    switch it off for paths.
  - >-
    Byte sequences that aren't valid UTF-8 are decoded as Windows-1252 and reported, which may not match the original
    system's encoding.
  - >-
    The decoder doesn't parse the URL into parts; it decodes the whole input.
faq:
  - q: "Why does my text still contain %20 after decoding?"
    a: >-
      The URL was probably encoded twice (%2520). Enable “Decode repeatedly until stable” to decode it fully.
  - q: "Should + become a space?"
    a: >-
      In query strings produced by HTML forms, yes — that's the default. In paths and in strictly RFC 3986 encoded data,
      + means a literal plus sign; turn the option off.
  - q: "What happens with a stray % sign?"
    a: >-
      It's left as is. Only valid %XX sequences are decoded, so text like “100% sure” survives.
  - q: "How is this different from decodeURIComponent?"
    a: >-
      decodeURIComponent throws an error on any malformed sequence and doesn't treat + as a space. This decoder handles
      both cases gracefully.
---

## How percent-decoding works

Each `%XX` is a byte written in hexadecimal. Characters outside ASCII take several bytes in UTF-8, so they appear as
runs: `%E2%82%AC` is the three bytes of the euro sign €. The decoder collects each run of `%XX` sequences, converts
it to bytes and decodes those bytes as UTF-8. If a run isn't valid UTF-8 — common with very old systems that encoded
Latin-1 — it falls back to Windows-1252 so you still get readable text, and tells you it did.

## Spotting double encoding

`%25` is the encoded form of `%`. When you see `%2520`, `%253A` or `%2526`, the text was encoded twice: decoding once
yields `%20`, `%3A`, `%26`. Repeated decoding stops as soon as the text no longer changes, so it's safe to leave on for
messy data.
