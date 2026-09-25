---
title: "CSV vs JSON vs XML vs YAML: Choosing a Data Format"
metaDescription: "How CSV, TSV, JSON, XML, YAML and XLSX differ — structure, types, nesting, comments — and what gets lost or changed when you convert between them."
h1: "CSV, JSON, XML and YAML compared: what changes when you convert"
summary: "Tables versus trees, types versus text, and the exact trade-offs when data moves between the common formats."
category: data
published: 2026-09-25
updated: 2026-09-25
tools: [csv-to-json, json-to-csv, xml-to-json, json-to-xml, json-to-yaml, yaml-to-json, csv-to-xlsx, csv-to-tsv]
---

Data formats fall into two families. **Tables** — CSV, TSV and spreadsheets — are grids of rows and columns.
**Trees** — JSON, XML and YAML — nest values inside values without limit. Most surprises in data conversion come
from crossing between these families, or from a format lacking something the other one has: types, comments,
attributes.

## The formats side by side

| | CSV / TSV | XLSX | JSON | XML | YAML |
|---|---|---|---|---|---|
| Shape | Table | Workbook of tables | Tree | Tree | Tree |
| Data types | None (text) | Numbers, text, booleans, dates | String, number, boolean, null | None without a schema | Strings, numbers, booleans, null |
| Nesting | No | No | Yes | Yes | Yes |
| Comments | No | Cell notes | No | Yes | Yes |
| Attributes | — | — | — | Yes | — |
| Typical use | Exports, imports | People analysing data | APIs, apps | Enterprise, feeds, documents | Configuration |

## Tables to trees: CSV → JSON, XML, YAML

The standard mapping turns the header row into field names and every following row into a record — an array of
objects in JSON. Three issues need decisions:

1. **Types.** CSV values are all text. Converting `42` to a number is helpful; converting a ZIP code `02134` to `2134`
   destroys data. A safe converter only converts when the number prints back identically. [CSV to JSON](/csv-to-json/)
   follows that rule.
2. **Delimiters.** Many CSVs use semicolons, tabs or pipes. Detection must look at the data, not assume commas.
3. **Nesting.** Columns named with dots (`address.city`) can be rebuilt into nested objects — but only if you ask for it.

## Trees to tables: JSON, XML, YAML → CSV

Going the other way means flattening:

- The **records** have to be found — a top-level array, or a list nested in an envelope like `{"data": […]}`.
- **Nested objects** become dotted columns (`address.city`).
- **Arrays** inside a record don't fit a cell; they're typically written as JSON text.
- **Columns** are the union of all keys, so sparse data produces many empty cells.

See [JSON to CSV](/json-to-csv/) and [XML to CSV](/xml-to-csv/) for how each handles these.

## JSON ↔ XML: attributes and lists

XML has two things JSON doesn't: **attributes** and **mixed content** (text interleaved with elements). JSON has two
things XML doesn't: **arrays** and **types**. Converters bridge the gap with conventions — attributes as `@name` keys,
element text as `#text`, repeated elements as arrays. The one unavoidable quirk: an element that appears once becomes a
single value, and one that appears twice becomes a list. [XML to JSON](/xml-to-json/) and [JSON to XML](/json-to-xml/)
use the same conventions so data can round-trip.

## JSON ↔ YAML: the easy pair, with traps

YAML 1.2 is a superset of JSON, so converting JSON to YAML is lossless. The trap is going back: in YAML, unquoted
values are typed by their appearance. Under the older YAML 1.1 rules, `no` means false (the “Norway problem”), `010`
is octal and `1:30` is a number. Good converters quote ambiguous strings when writing YAML
([JSON to YAML](/json-to-yaml/)) and use YAML 1.2 rules when reading it ([YAML to JSON](/yaml-to-json/)). Comments,
anchors and multi-document files are YAML-only features that don't survive a trip through JSON.

## CSV versus XLSX

A CSV has no types, so every application guesses. Excel's guesses are notorious: leading zeros vanish, long numbers
turn into scientific notation and lose digits beyond 15, and text that resembles a date becomes one. Converting to
XLSX with explicit cell types avoids the guessing — [CSV to XLSX](/csv-to-xlsx/) stores values as numbers only when
that's lossless.

## CSV versus TSV

The only difference is the delimiter, but it matters: commas are common in text and force quoting; tabs almost never
appear in data, so TSV rarely needs quotes. That makes TSV ideal for command-line tools and clipboard exchange, and CSV
the more widely accepted import format. [CSV to TSV](/csv-to-tsv/) and [TSV to CSV](/tsv-to-csv/) convert properly
quoted data in both directions.

## Encoding and line endings

Use UTF-8. It represents every script and emoji and is what JSON requires. Some older Excel versions need a UTF-8
byte-order mark (BOM) to detect it in CSV files. Line endings (CRLF versus LF) rarely matter to modern tools; RFC 4180
specifies CRLF for CSV.

## Choosing a format

- **Sending data to people** → XLSX (or CSV if they'll import it somewhere).
- **Sending data to programs over the web** → JSON.
- **Configuration edited by humans** → YAML (or JSON if tools need it).
- **Industry standards, feeds, documents with schemas** → XML.
- **Bulk loads and command-line pipelines** → CSV or TSV.
