---
intro: >-
  XML configuration and data files are notoriously verbose: every value is wrapped in an opening and closing tag.
  YAML expresses the same tree with indentation, which makes it much easier to read, review and keep in version
  control. This converter parses XML and writes block-style YAML: elements become keys, repeated elements become lists,
  attributes keep an @ prefix, and text next to attributes goes under #text.


  The XML is validated first with line/column error messages, values are kept as exact strings, and documents with
  custom entity declarations are refused for safety. Everything runs locally in your browser.
useCases:
  - title: "Modernising configuration"
    text: >-
      Move XML config into YAML-based tooling or simply make it readable.
  - title: "Reviewing XML data"
    text: >-
      Skim large XML exports in a compact, indentation-based view.
  - title: "Docs and examples"
    text: >-
      Present XML payloads as YAML in documentation where readability matters.
  - title: "Preparing data for YAML-driven tools"
    text: >-
      Feed static-site generators or Ansible with data that originated as XML.
limitations:
  - >-
    Repeated elements become lists, single elements become values — the same element can have different shapes in
    different documents.
  - >-
    All values are strings; the YAML serializer quotes those that could be misread (for example "42" or "true").
  - >-
    Comments, processing instructions and namespace URIs are not carried over; prefixes remain in key names.
faq:
  - q: "What happens to XML attributes?"
    a: >-
      They become keys with an @ prefix (configurable). An element with attributes and text gets its text under #text.
  - q: "Why are numbers quoted in the YAML?"
    a: >-
      XML values are text. To avoid silently turning "007" or "true" into a number or boolean, strings that look like
      other types are quoted.
  - q: "Can I convert the YAML back to XML?"
    a: >-
      Yes. The YAML to XML converter understands the same @ and #text conventions.
  - q: "Is my file uploaded?"
    a: >-
      No. Parsing and conversion happen entirely in your browser tab.
---

## Why XML becomes so much shorter

A value like `<timeout>30</timeout>` spends 19 characters on markup for two characters of data. YAML writes
`timeout: "30"`. For deeply nested configuration the difference is dramatic, and the structure becomes visible through
indentation instead of matching tag names by eye.

## Keeping the meaning intact

XML treats everything as text, while YAML parsers guess types from unquoted values. To avoid a value such as `08` or
`no` changing meaning when the YAML is read back, the converter quotes any string that a YAML parser could interpret
as a number, boolean or null.
