---
intro: >-
  Encoding JSON as Base64 is how many systems pass structured data through channels that only accept simple strings:
  query parameters, HTTP headers, cookies, message queues, environment variables and token payloads. This tool
  validates your JSON first — so you never encode a broken payload — optionally minifies it to keep the result short,
  and encodes the UTF-8 bytes as standard or URL-safe Base64.


  Invalid JSON is reported with its line and column. Output updates as you type, and nothing leaves your browser.
useCases:
  - title: "Passing state in URLs"
    text: >-
      Encode small JSON objects with the URL-safe alphabet to put them in a query parameter or fragment.
  - title: "Custom HTTP headers"
    text: >-
      Some APIs expect JSON metadata as a Base64 header value, for example X-Client-Data style headers.
  - title: "Building test tokens"
    text: >-
      Create the Base64url segments of a JWT header or payload for testing.
  - title: "Config and CI variables"
    text: >-
      Store JSON in a single-line, quote-free environment variable.
limitations:
  - >-
    Base64 is not encryption: the JSON is readable by anyone who decodes it.
  - >-
    Encoded output is about a third larger than the (minified) JSON.
  - >-
    Minifying removes whitespace only; key order and values are unchanged. Disable it to encode the text exactly as
    pasted.
  - >-
    This tool doesn't sign anything — a Base64url payload is not a valid JWT without a proper signature.
faq:
  - q: "Why validate the JSON first?"
    a: >-
      Encoding broken JSON produces a Base64 string that fails later, far from the cause. Validation catches trailing
      commas, single quotes and unbalanced brackets immediately.
  - q: "Should I minify before encoding?"
    a: >-
      Usually yes. Removing whitespace makes the Base64 shorter, which matters in URLs and headers. The data is identical.
  - q: "When should I use URL-safe Base64?"
    a: >-
      Whenever the value goes into a URL, cookie or file name. Standard Base64's + and / characters have special
      meanings there.
  - q: "How do I decode it again?"
    a: >-
      Use the Base64 to JSON decoder; it also pretty-prints the result.
---

## Minify, then encode

Pretty-printed JSON is full of spaces and line breaks that carry no data. `{"user": "ana", "roles": ["admin"]}` and
`{"user":"ana","roles":["admin"]}` are the same object, but the second is shorter — and Base64 multiplies every byte by
4/3. With minification on, the JSON is parsed and re-serialised compactly before encoding.

## Standard versus URL-safe

Standard Base64 uses `+`, `/` and `=` padding, which clash with URL syntax: `+` means space in form encoding, `/`
separates path segments, and `=` separates keys from values. The URL-safe alphabet from RFC 4648 section 5 replaces them
with `-` and `_` and drops the padding. That's the variant used by JWTs and most web tokens.
