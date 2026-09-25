---
intro: >-
  XML exports — product feeds, RSS, bank statements, ERP extracts, government datasets — are hard to analyse until
  they're in a table. This converter finds the repeating record element in your XML (every <item>, <product> or
  <row>), makes each one a CSV row, and turns child elements and attributes into columns, flattening nested elements
  with dotted names.


  It validates the XML first and reports the exact line and column of any syntax error. Paste XML or drop files; the
  CSV opens in Excel, Google Sheets or any database tool. Nothing is uploaded.
useCases:
  - title: "Product feeds into a spreadsheet"
    text: >-
      Audit or edit a Google Shopping or marketplace XML feed in Excel.
  - title: "RSS and Atom analysis"
    text: >-
      Turn feed items into rows to review titles, dates and links.
  - title: "Open-data portals"
    text: >-
      Government and statistics agencies often publish XML; CSV makes it usable in any analysis tool.
  - title: "Migrating legacy exports"
    text: >-
      Move data from XML-based systems into tools that import CSV.
limitations:
  - >-
    Only the largest group of repeating elements becomes rows; data outside those records (such as a document header)
    is not included.
  - >-
    Repeated child elements inside a record (several <tag> elements) are written as JSON text in one cell.
  - >-
    Namespace prefixes are kept as part of column names (e.g. dc:creator); namespace URIs are not shown.
  - >-
    Comments, processing instructions and DOCTYPE declarations are ignored. XML with custom <!ENTITY> definitions is
    rejected for safety.
faq:
  - q: "How does it know which elements are the rows?"
    a: >-
      It looks for the largest list of repeated elements, such as all <book> elements inside <catalog>, and reports the
      path it used.
  - q: "What happens to attributes?"
    a: >-
      They become columns prefixed with @ by default, e.g. @id. You can choose _ or no prefix in Settings.
  - q: "Are nested elements supported?"
    a: >-
      Yes. <address><city>Paris</city></address> becomes a column named address.city.
  - q: "My XML won't convert — why?"
    a: >-
      The XML is validated first. If it isn't well-formed — an unclosed tag, an unescaped & — the error message tells you
      the line and column so you can fix it.
---

## Finding the records

Tabular data in XML usually looks like a container element holding many siblings with the same name:
`<catalog><book>…</book><book>…</book></catalog>`. After parsing, those siblings become a list; the converter searches
the document for the largest list of records and uses it. It reports the path — for example “Used the 120 records found
at catalog.book” — so you can confirm it picked the right element.

## Attributes versus elements

XML has two places to put data: attributes (`<book id="bk101">`) and child elements (`<title>…</title>`). Tables don't
make that distinction, so attributes get a prefix to avoid clashing with child elements of the same name. Text that
sits directly inside an element that also has attributes appears in a `#text` column.

## Mixed content caveat

Document-style XML — prose with inline markup like `<p>Some <b>bold</b> text</p>` — isn't tabular. The converter
still produces output, but inline elements are separated from the surrounding text. It's designed for data-style XML.
