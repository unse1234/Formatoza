---
intro: >-
  XML still arrives from many places — RSS feeds, SOAP responses, sitemaps, Office and SVG internals, bank and
  government exports — while modern code and tools work best with JSON. This converter parses XML into a JSON object
  that mirrors the document: elements become keys, repeated elements become arrays, attributes are kept with an @
  prefix, and text alongside attributes goes into #text.


  The XML is validated first, with line and column numbers for any error. Values are kept exactly as text so nothing
  is reinterpreted. Paste XML or drop files — the conversion runs entirely in your browser.
useCases:
  - title: "Working with SOAP or legacy APIs"
    text: >-
      Inspect XML responses as JSON or feed them to JavaScript code.
  - title: "Parsing RSS and sitemaps"
    text: >-
      Turn feeds and sitemap files into JSON for scripts and dashboards.
  - title: "Migrating configuration"
    text: >-
      Move XML configuration into JSON-based tools.
  - title: "Debugging integrations"
    text: >-
      JSON is often easier to read and diff than verbose XML.
limitations:
  - >-
    An element that appears once becomes an object or string, while one that appears several times becomes an array.
    Code consuming the JSON should handle both shapes.
  - >-
    All values are strings (“42”, “true”); XML carries no type information without a schema.
  - >-
    Comments, processing instructions and the XML declaration are dropped; CDATA content is merged into normal text.
  - >-
    Namespace prefixes are kept in key names (dc:title), but namespace URIs are not resolved. Documents defining custom
    <!ENTITY> declarations are rejected for safety.
faq:
  - q: "How are attributes represented?"
    a: >-
      As keys with a prefix — @id by default. You can switch to _id or no prefix in Settings, though no prefix can clash
      with child elements of the same name.
  - q: "Why is one element an array and another an object?"
    a: >-
      XML doesn't mark lists. When an element name repeats inside the same parent it becomes an array; when it appears
      once it stays a single value.
  - q: "Are numbers converted?"
    a: >-
      No. Values stay strings exactly as written, so leading zeros, formatting and precision are preserved.
  - q: "What happens with invalid XML?"
    a: >-
      Conversion stops with a message giving the line, column and reason — for example an unclosed tag or an unescaped &.
---

## The single-versus-list problem

The biggest surprise in XML-to-JSON conversion is structural: `<tags><tag>a</tag></tags>` and
`<tags><tag>a</tag><tag>b</tag></tags>` produce different JSON shapes — `{"tag": "a"}` versus `{"tag": ["a", "b"]}` —
because the converter can't know that `tag` is meant to be a list. Every generic XML-to-JSON converter faces this. When
you consume the result in code, normalise with something like `[].concat(x)` or check `Array.isArray`.

## Security

XML parsers are a classic attack surface: external entities can read local files (XXE) and nested entity definitions
can expand a tiny document into gigabytes (“billion laughs”). This converter never resolves external entities and
refuses documents that declare their own entities, so malicious XML can't exhaust your browser.
