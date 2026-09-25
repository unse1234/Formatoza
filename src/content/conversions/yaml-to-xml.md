---
intro: >-
  Sometimes configuration or data authored in YAML has to be delivered to a system that only reads XML — an enterprise
  integration, a Java or .NET application, a document pipeline. This converter parses YAML (with anchors, aliases and
  merge keys resolved) and writes well-formed XML: mappings become elements, sequences become repeated elements, and
  keys starting with @ become attributes.


  You choose the root and list-item element names; invalid names are sanitised and text is escaped. Paste YAML or drop
  files; the conversion runs in your browser.
useCases:
  - title: "Feeding XML-based systems"
    text: >-
      Author readable YAML and generate the XML an application or partner requires.
  - title: "Java and .NET configuration"
    text: >-
      Produce XML config from YAML sources kept in version control.
  - title: "Documentation pipelines"
    text: >-
      Convert YAML metadata into XML consumed by publishing tools.
  - title: "Format migration"
    text: >-
      Move data between YAML-based and XML-based tooling.
limitations:
  - >-
    YAML comments are not carried into the XML.
  - >-
    Types are lost: numbers and booleans become text inside elements.
  - >-
    Keys that aren't valid XML names are changed (spaces and symbols become underscores).
  - >-
    Custom YAML tags such as !Ref are not supported, and multi-document YAML is wrapped in a single root.
faq:
  - q: "How are YAML lists converted?"
    a: >-
      Each item becomes a repeated element named after the list's key: tags: [a, b] becomes <tags>a</tags><tags>b</tags>.
      Items of a top-level list use the item element name from Settings.
  - q: "Can I produce XML attributes?"
    a: >-
      Yes. Keys starting with @ become attributes of their parent element, for example "@id": 7.
  - q: "What becomes the root element?"
    a: >-
      If the YAML has exactly one top-level key holding a mapping, that key is the root. Otherwise the content is wrapped
      in <root>, which you can rename.
  - q: "Are anchors and aliases expanded?"
    a: >-
      Yes. Aliases are replaced with the anchored content before the XML is written.
---

## From indentation to tags

YAML and XML both describe trees, but they express them differently. A YAML mapping maps naturally to an element with
child elements, and a scalar value to an element's text. Sequences are the tricky part: XML has no list type, so a list
is written as repeated sibling elements sharing a name — the same convention used when converting JSON to XML.

```yaml
server:
  host: example.com
  ports: [80, 443]
```

becomes

```xml
<server>
  <host>example.com</host>
  <ports>80</ports>
  <ports>443</ports>
</server>
```

## What gets simplified

Everything that is YAML-specific disappears in XML: comments, anchors (they're expanded), explicit types and
multi-document structure. The XML carries the data, not the authoring conveniences.
