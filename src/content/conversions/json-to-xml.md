---
intro: >-
  When a system speaks XML — SOAP services, enterprise integrations, configuration formats, document stores — and your
  data is JSON, you need a predictable mapping between the two. This converter turns JSON objects into elements, arrays
  into repeated elements, and keys prefixed with @ into attributes, producing well-formed, indented XML with an XML
  declaration.


  Invalid element names are sanitised, text is escaped, and you choose the root and list-item element names. The
  output converts back to the same JSON with the XML to JSON tool. Paste JSON or drop files; everything runs locally.
useCases:
  - title: "Calling SOAP or XML APIs"
    text: >-
      Draft XML request bodies from JSON you already have.
  - title: "Configuration files"
    text: >-
      Some Java, .NET and Android tooling reads XML config; generate it from JSON.
  - title: "Data exchange with partners"
    text: >-
      Deliver JSON data to partners whose systems accept XML only.
  - title: "Testing XML pipelines"
    text: >-
      Produce sample XML documents quickly from JSON fixtures.
limitations:
  - >-
    XML has no native arrays, numbers or booleans. Arrays become repeated elements and all values become text; an
    array with one item looks the same as a single value when converted back.
  - >-
    Keys that aren't valid XML names are changed (spaces and symbols become underscores, leading digits get an
    underscore), which can't be reversed automatically.
  - >-
    null values become empty elements, so null and "" look the same in XML.
  - >-
    No namespaces, schema references or CDATA sections are generated.
faq:
  - q: "How are JSON arrays represented?"
    a: >-
      As repeated elements named after their key: {"tag": ["a", "b"]} becomes <tag>a</tag><tag>b</tag>. A top-level array
      becomes <root><item>…</item></root>, with names you can change.
  - q: "How do I create attributes?"
    a: >-
      Prefix the key with @: {"book": {"@id": "bk101", "title": "…"}} produces <book id="bk101"><title>…</title></book>.
  - q: "Which root element is used?"
    a: >-
      If the JSON is an object with a single key whose value is an object, that key becomes the root. Otherwise
      everything is wrapped in <root>, which you can rename.
  - q: "Are characters like & and < escaped in the XML?"
    a: >-
      Yes — &, < and > in values are escaped, and characters XML 1.0 forbids are removed.
---

## The JSON ↔ XML mapping

| JSON | XML |
|---|---|
| `{"a": "x"}` | `<a>x</a>` |
| `{"a": {"b": 1}}` | `<a><b>1</b></a>` |
| `{"a": [1, 2]}` | `<a>1</a><a>2</a>` |
| `{"a": {"@id": "7", "#text": "x"}}` | `<a id="7">x</a>` |
| `{"a": null}` | `<a/>` |

The `@` and `#text` conventions are the same ones the XML to JSON converter produces, so XML can make a round trip
through JSON and back.

## Why XML loses type information

In JSON, `1`, `"1"` and `true` are different things. In XML they're all just text inside an element unless an XSD
schema says otherwise. Systems consuming the XML therefore interpret values according to their own schema. If a
receiving system is strict about formats (dates, decimals), check its schema and adjust the JSON values before
converting.
