---
title: "Base64 and URL Encoding Explained, With Examples"
metaDescription: "What Base64 and percent-encoding are for, how they work byte by byte, why UTF-8 matters, and how to avoid double encoding, broken tokens and mangled URLs."
h1: "Base64 and URL encoding explained"
summary: "Why data gets encoded, how Base64 and percent-encoding work, and the mistakes that break tokens, links and payloads."
category: developer
published: 2026-09-25
updated: 2026-09-25
tools: [text-to-base64, base64-to-text, json-to-base64, base64-to-json, url-encode, url-decode]
---

Encodings exist because many channels only accept a limited set of characters. URLs can't contain spaces, HTTP headers
can't contain raw binary, and JSON strings can't hold arbitrary bytes. Base64 and percent-encoding (URL encoding)
transform data into safe characters and back again. Neither provides any security — they're about transport, not
secrecy.

## Base64

### How it works

Base64 reads the input three bytes (24 bits) at a time and splits them into four groups of six bits. Each 6-bit value
(0–63) is written as one character from a 64-character alphabet: `A–Z`, `a–z`, `0–9`, `+` and `/`. If the input length
isn't a multiple of three, the output is padded with `=`.

```
Text:     M        a        n
Bytes:    77       97       110
Bits:     01001101 01100001 01101110
6-bit:    010011 010110 000101 101110
Base64:   T      W      F      u
```

Every 3 bytes become 4 characters, so Base64 output is about **33% larger** than the input.

### Where you'll meet it

- **HTTP Basic auth**: `Authorization: Basic dXNlcjpwYXNz` is `user:pass` in Base64.
- **Data URLs**: `data:image/png;base64,iVBORw0…` embeds a file in HTML or CSS.
- **Email attachments**: MIME encodes binary parts as Base64 wrapped at 76 characters.
- **JWTs**: the header and payload are JSON encoded as URL-safe Base64.
- **Kubernetes Secrets** and many configuration systems.

### Standard versus URL-safe

`+` and `/` have special meanings in URLs and file paths, and `=` separates keys from values in query strings. The
URL-safe alphabet (RFC 4648 §5) uses `-` and `_` instead and usually omits padding. A decoder that doesn't expect the
URL-safe variant will fail on it — [Base64 to Text](/base64-to-text/) detects both.

### The UTF-8 trap

Base64 encodes *bytes*. Text must first be converted to bytes, and the result depends on the character encoding.
“é” is one byte in Latin-1 (`E9`) but two in UTF-8 (`C3 A9`), so the Base64 differs. JavaScript's `btoa()` refuses
characters above U+00FF entirely. Always encode text as UTF-8 unless a system explicitly says otherwise — as
[Text to Base64](/text-to-base64/) does.

## Percent-encoding (URL encoding)

### How it works

RFC 3986 allows a small set of *unreserved* characters in URLs without encoding: `A–Z a–z 0–9 - . _ ~`. Everything else
in a value is converted to UTF-8 bytes, each written as `%` plus two hex digits.

| Character | UTF-8 bytes | Encoded |
|---|---|---|
| space | 20 | `%20` (or `+` in forms) |
| & | 26 | `%26` |
| é | C3 A9 | `%C3%A9` |
| 👋 | F0 9F 91 8B | `%F0%9F%91%8B` |

### Encode values, not whole URLs

The characters `: / ? # & =` give a URL its structure. A search term like `salt & pepper` must have its `&` encoded,
or the server sees two parameters. Build URLs by encoding each value separately — [URL Encoder](/url-encode/) in
value mode — then join them with the structural characters.

### `%20` or `+`?

In paths and RFC 3986, a space is `%20`. HTML form submissions (`application/x-www-form-urlencoded`) write spaces as `+`
and decode `+` as a space. Mixing the conventions turns plus signs in data into spaces — a classic bug with phone
numbers like `+44…` in query strings.

### Double encoding

Encoding an already-encoded string turns `%` into `%25`: `%20` becomes `%2520`. You'll see this in broken links and
redirect chains. The fix is to decode repeatedly until the text stops changing — [URL Decoder](/url-decode/) has an
option for exactly that.

## JSON inside Base64

APIs and tokens often carry JSON encoded as Base64 so it survives headers and URLs. Minify the JSON first to keep it
short ([JSON to Base64](/json-to-base64/)), and decode with a tool that pretty-prints and validates the result
([Base64 to JSON](/base64-to-json/)). For JWTs, remember that decoding shows the claims but says nothing about whether
the token is genuine — only signature verification with the right key does.

## Encoding is not encryption

Anyone can decode Base64 or percent-encoding instantly. Never rely on them to hide passwords, API keys or personal
data. If something must be secret, encrypt it; if it must be tamper-proof, sign it.
