---
intro: >-
  Plenty of systems still exchange data as XML — product feeds for marketplaces, ERP and accounting imports, government
  reporting, legacy SOAP services. When your data lives in a spreadsheet, converting CSV to XML is the bridge. This
  converter turns each row into a record element and each column into a child element, producing well-formed XML with
  the root and record element names you choose.


  Header names are turned into valid XML element names automatically, special characters such as & and < are escaped,
  and control characters that XML forbids are removed. Paste CSV or drop files; the conversion runs in your browser.
useCases:
  - title: "Product and inventory feeds"
    text: >-
      Build XML feeds for shopping platforms, affiliate networks or partner integrations from a spreadsheet.
  - title: "ERP and accounting imports"
    text: >-
      Many business systems import records as XML with a fixed element structure.
  - title: "Legacy integrations"
    text: >-
      Produce XML payloads for SOAP services or older middleware from exported data.
  - title: "Test data for XML parsers"
    text: >-
      Quickly generate structured XML documents from tabular sample data.
limitations:
  - >-
    The output uses elements only (no attributes) with a generic structure: <root><row><column>…. If a partner requires
    a specific schema, rename elements or transform with XSLT afterwards.
  - >-
    No XML namespaces or schema (XSD) references are added.
  - >-
    Column names that aren't valid XML names are changed: spaces and symbols become underscores, and a name starting
    with a digit gets an underscore prefix.
  - >-
    With “Detect numbers and true/false” on, values are still written as text — XML has no data types without a schema.
faq:
  - q: "What does the XML look like?"
    a: >-
      By default <rows><row><name>Ana</name><city>Porto</city></row>…</rows>. You can rename rows and row in Settings,
      for example to products and product.
  - q: "How are invalid column names handled?"
    a: >-
      XML element names can't contain spaces, start with a digit or include most punctuation. “Unit price” becomes
      Unit_price and “2024 total” becomes _2024_total.
  - q: "What happens to &, < and > in my CSV values?"
    a: >-
      Yes. &, < and > in values are escaped as entities, and characters that are illegal in XML 1.0 (most control
      characters) are removed.
  - q: "Can I create nested elements?"
    a: >-
      Yes. Enable “Nest dotted column names”: columns such as address.city and address.zip become
      <address><city>…</city><zip>…</zip></address>.
---

## Rows to records, columns to elements

The mapping is the simplest one that works with any CSV:

```
name,city            <rows>
Ana,Porto      →       <row><name>Ana</name><city>Porto</city></row>
                     </rows>
```

Every row becomes a record element, every header becomes a child element name, and every cell becomes that element's
text. Empty cells become empty (self-closing) elements, so every record has the same shape.

## Valid names and safe text

XML is strict. Element names must start with a letter or underscore and contain only letters, digits, hyphens,
underscores and periods. The converter sanitises headers accordingly and never lets a value break the document: text is
entity-escaped, and characters XML 1.0 can't represent even when escaped — such as the NUL or form-feed control
characters that occasionally sneak into exports — are removed.
