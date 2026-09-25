---
intro: >-
  Base64 turns arbitrary bytes into a limited set of 64 ASCII characters so data can pass through systems that only
  handle text: HTTP headers, JSON fields, data URLs, environment variables, email. Encoding text correctly requires
  first converting it to bytes, and that's where many quick tools go wrong with accents, CJK characters or emoji. This
  encoder always uses UTF-8, so “café 👋” encodes and decodes identically everywhere.


  Choose the URL-safe alphabet (- and _ instead of + and /, no padding) for URLs, filenames and JWT-style tokens, or wrap
  lines at 76 characters for MIME email bodies. The result updates as you type, entirely in your browser.
useCases:
  - title: "HTTP Basic authentication"
    text: >-
      Encode username:password for an Authorization: Basic header while testing an API.
  - title: "Configuration and secrets files"
    text: >-
      Kubernetes Secrets and many CI systems expect values to be Base64-encoded.
  - title: "Embedding text in URLs or JSON"
    text: >-
      Use the URL-safe variant to pass text safely inside query strings or tokens.
  - title: "Email and MIME debugging"
    text: >-
      Produce MIME-style, line-wrapped Base64 to compare with raw email sources.
limitations:
  - >-
    Base64 is an encoding, not encryption — anyone can decode it. Never treat Base64 values as protected.
  - >-
    The output is about 33% larger than the input's UTF-8 bytes (4 characters for every 3 bytes).
  - >-
    Text is always encoded as UTF-8. If a system expects UTF-16 or Latin-1 bytes, the result won't match its own encoder.
  - >-
    Lone surrogate characters (invalid Unicode) are replaced with U+FFFD before encoding.
faq:
  - q: "Why does my Base64 differ from another tool's?"
    a: >-
      Usually because of the character encoding. This tool uses UTF-8; some older tools use Latin-1 or UTF-16, which
      produce different bytes for non-ASCII characters. Line wrapping and padding also cause differences.
  - q: "What is URL-safe Base64?"
    a: >-
      A variant from RFC 4648 that replaces + with - and / with _ and usually drops the = padding, so the result can be
      used in URLs and file names without escaping. JWTs use it.
  - q: "Is Base64 secure?"
    a: >-
      No. It hides nothing: decoding is trivial and needs no key. Use encryption if data must be protected.
  - q: "Is my text sent to a server?"
    a: >-
      No. Encoding happens in your browser, so it's safe to encode credentials for testing — though you should still
      avoid pasting production secrets into any website.
---

## How Base64 works

Base64 takes the input three bytes (24 bits) at a time and splits them into four 6-bit groups, each mapped to one of
64 characters: `A–Z`, `a–z`, `0–9`, `+` and `/`. When the input isn't a multiple of three bytes, the output is padded
with one or two `=` signs. “Man” (bytes 77 97 110) becomes `TWFu`; “Ma” becomes `TWE=`.

## Why UTF-8 matters

Base64 encodes bytes, not characters, so text must first be turned into bytes. JavaScript's built-in `btoa()` only
accepts characters below U+0100 and throws on anything else — which is why naive web tools fail on emoji or produce
garbage for accented letters. This encoder converts text to UTF-8 bytes first, the encoding used by the web, JSON and
nearly every modern system, so the result decodes correctly in any language's standard library.
