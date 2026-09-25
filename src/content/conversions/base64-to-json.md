---
intro: >-
  Encoded JSON hides inside tokens, cookies, headers and message payloads, and reading it means decoding the Base64 and
  then making sense of a one-line JSON blob. This tool does both steps: it decodes standard or URL-safe Base64 (padding
  optional), parses the result as JSON and pretty-prints it with the indentation you choose — or tells you precisely why
  the decoded text isn't valid JSON.


  Paste a whole JSON Web Token and the header and payload are decoded together, with a clear note that the signature
  isn't verified. Everything happens locally, which matters when you're inspecting real tokens.
useCases:
  - title: "Inspecting JWTs"
    text: >-
      See the claims in an access or ID token — expiry, issuer, scopes — without sending it to a third-party site.
  - title: "Debugging encoded payloads"
    text: >-
      Decode Base64 JSON from message queues, webhooks, cookies and logs.
  - title: "Reading cloud metadata"
    text: >-
      Many cloud and auth systems embed Base64 JSON in headers or query strings.
  - title: "Checking your own encoder"
    text: >-
      Verify that a value your code produces decodes to the JSON you expect.
limitations:
  - >-
    JWT signatures are never verified; decoding shows claims, not whether the token is authentic.
  - >-
    Encrypted tokens (JWE) or compressed payloads can't be read — they are not plain Base64 JSON.
  - >-
    Decoded text must be valid JSON; JSON with comments or trailing commas is rejected.
faq:
  - q: "Can I paste an entire JWT?"
    a: >-
      Yes. A token in the form header.payload.signature is detected, and the header and payload are decoded into one JSON
      object. The signature is ignored.
  - q: "Is it safe to decode tokens here?"
    a: >-
      Decoding happens in your browser and nothing is sent anywhere. Even so, treat live production tokens as
      credentials and avoid pasting them into tools you don't trust.
  - q: "What if the decoded data isn't JSON?"
    a: >-
      You'll get the parse error with its position. If the data is binary, try Base64 to Text, which detects files.
  - q: "Does it handle missing padding?"
    a: >-
      Yes. URL-safe Base64 usually omits = padding; it's added back automatically.
---

## Anatomy of a JWT

A JSON Web Token is three Base64url strings joined by dots: a header (algorithm and type), a payload (claims such as
`sub`, `exp`, `iss`), and a signature. The first two are simply JSON encoded with URL-safe Base64 and no padding —
which is why they can be decoded without any key. The signature is what proves the token was issued by someone holding
the secret or private key; verifying it requires that key and is deliberately out of scope for a decoder.

## Reading common claims

- `exp` / `iat` / `nbf` — Unix timestamps (seconds since 1970) for expiry, issue time and “not before”.
- `sub` — the subject, usually a user ID.
- `aud` / `iss` — the intended audience and the issuer.
- `scope` / `roles` — permissions, depending on the provider.
