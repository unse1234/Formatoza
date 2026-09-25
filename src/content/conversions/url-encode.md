---
intro: >-
  URLs may only contain a limited set of characters; everything else — spaces, accented letters, emoji, and characters
  with special meaning like &, ?, = and # — must be percent-encoded as %XX bytes. Getting this wrong breaks links and
  query strings in subtle ways: a value containing & gets cut in two, a # truncates the URL. This encoder percent-encodes
  text using UTF-8, the way browsers and servers expect.


  Choose between encoding a single value (a query parameter or path segment, where & / ? = are encoded) and encoding a
  whole URL (where those characters are kept). Optionally write spaces as + like HTML forms, or encode each line
  separately. Results update as you type, in your browser.
useCases:
  - title: "Building query strings"
    text: >-
      Encode parameter values containing spaces, &, = or non-ASCII characters before adding them to a URL.
  - title: "Redirect and callback URLs"
    text: >-
      Encode a full URL so it can be passed as a parameter, e.g. ?redirect_uri=….
  - title: "API requests and curl commands"
    text: >-
      Prepare path segments and query values for manual API calls.
  - title: "Batch-encoding lists"
    text: >-
      Encode a list of search terms or file names line by line.
limitations:
  - >-
    Text that is already percent-encoded will be encoded again (% becomes %25). The tool warns you when it detects this.
  - >-
    Encoding is always UTF-8; legacy systems expecting Latin-1 percent-encoding will see different bytes for non-ASCII
    characters.
  - >-
    “Whole URL” mode doesn't validate the URL or encode reserved characters, so it can't fix a malformed URL's
    structure.
faq:
  - q: "Should I encode a value or a whole URL?"
    a: >-
      Encode values. Take each query parameter value or path segment, encode it, then assemble the URL. Encoding a
      whole URL keeps : / ? & = # intact, which is only correct if the URL is already well-formed.
  - q: "Is a space %20 or +?"
    a: >-
      In URL paths and in RFC 3986 it's %20. In HTML form submissions (application/x-www-form-urlencoded) it's +.
      Enable “Encode spaces as +” only for form-style query strings.
  - q: "Which characters are left unencoded?"
    a: >-
      In value mode only the RFC 3986 unreserved characters: A–Z, a–z, 0–9 and - . _ ~. Everything else, including ! ' (
      ) *, is encoded.
  - q: "What's the difference from JavaScript's encodeURIComponent?"
    a: >-
      encodeURIComponent leaves ! ' ( ) * unencoded. This tool also encodes those, following RFC 3986 strictly, which is
      what many signature schemes (like OAuth 1.0 and AWS SigV4) require.
---

## Reserved and unreserved characters

RFC 3986 divides URL characters into *unreserved* ones, which never need encoding (`A–Z a–z 0–9 - . _ ~`), and
*reserved* ones that structure the URL: `: / ? # [ ] @` and the sub-delimiters `! $ & ' ( ) * + , ; =`. A reserved
character inside a value must be encoded, or it will be read as structure — `q=salt&pepper` becomes two parameters.
Everything else, including spaces and all non-ASCII text, is converted to UTF-8 bytes and written as `%XX`: `é` is
`%C3%A9`, `👋` is `%F0%9F%91%8B`.

## Double encoding

Encoding an already-encoded string turns `%20` into `%2520`, because `%` itself becomes `%25`. That's the source of
links with `%2520` in them. If your input already contains `%XX` sequences, decode it first (or leave it as is).
