---
intro: >-
  JSON from an API, a log export or a NoSQL database is easy for programs to read and awkward for people: you can't sort
  or filter it in a spreadsheet. This converter flattens JSON records into a CSV table that opens cleanly in Excel,
  Google Sheets, Numbers or any database import tool.


  It finds the array of records automatically — even when it's wrapped inside an object like {"data": […]} — turns
  nested objects into dotted columns such as address.city, and builds the header from every key that appears in any
  record, in first-seen order. Output follows RFC 4180 quoting. Paste JSON or drop files; nothing leaves your browser.
useCases:
  - title: "Analysing API responses in a spreadsheet"
    text: >-
      Sort, filter and pivot data from REST APIs without writing code.
  - title: "Exporting from MongoDB or Firestore"
    text: >-
      Turn document exports into a flat table for reporting or sharing with non-developers.
  - title: "Importing into SQL databases"
    text: >-
      Most databases bulk-load CSV; flatten JSON first, then import with COPY or LOAD DATA.
  - title: "Sharing data with colleagues"
    text: >-
      CSV opens in any spreadsheet app, unlike JSON.
limitations:
  - >-
    Arrays inside records (tags, line items) are written as JSON text in a single cell, e.g. ["a","b"], because a table
    has no natural way to represent a list.
  - >-
    Deeply nested or very heterogeneous data can produce many sparse columns.
  - >-
    Numbers are written as JSON stores them; very large integers may already have lost precision when the JSON was
    produced by JavaScript.
  - >-
    Excel may re-interpret values when opening a CSV (dates, long numbers, leading zeros). Use CSV to XLSX afterwards
    or the “Add UTF-8 BOM” option to control how Excel reads the file.
faq:
  - q: "What JSON structure is expected?"
    a: >-
      An array of objects works best: [{…}, {…}]. The converter also accepts an object containing such an array (it uses
      the largest one and tells you where it found it), JSON Lines with one object per line, or a single object.
  - q: "How are nested objects handled?"
    a: >-
      They're flattened into columns with dotted names: {"address": {"city": "Paris"}} becomes a column address.city. Turn
      off flattening in Settings to keep nested objects as JSON text instead.
  - q: "What if records have different keys?"
    a: >-
      Every key that appears in any record becomes a column, in the order first seen. Records missing a key get an
      empty cell.
  - q: "Why do accented characters look wrong in Excel?"
    a: >-
      Older Excel versions assume a legacy encoding for CSV files. Enable “Add UTF-8 BOM for Excel” so Excel detects
      UTF-8 correctly, or open the file via Data → From Text/CSV.
  - q: "Can the output use semicolons?"
    a: >-
      Yes. Choose semicolon as the output delimiter for spreadsheets in locales that use a comma as the decimal
      separator.
---

## Finding the records

JSON rarely arrives as a bare array. APIs wrap results in envelopes — `{"data": […], "meta": {…}}`,
`{"results": […]}`, `{"response": {"items": […]}}`. The converter searches a few levels deep for arrays of objects and
uses the largest one, reporting its path (for example “Used the 250 records found at data.items”). If there is no
array anywhere, the whole object becomes a single row.

## Flattening rules

- **Nested objects** → dotted column names (`user.address.city`).
- **Arrays** → JSON text in one cell (`["red","blue"]`).
- **null** → empty cell; **true/false** → `true`/`false`.
- **Column order** → keys in the order they first appear across all records.

These rules are reversible: CSV to JSON with “Nest dotted column names” turns the dotted columns back into objects.

## Protecting spreadsheets from formulas

A cell starting with `=`, `+`, `-` or `@` may be executed as a formula when a CSV is opened in a spreadsheet, which is a
known attack vector (“CSV injection”) when data comes from untrusted users. Enable “Neutralise spreadsheet formulas” to
prefix such values with an apostrophe; numeric values like -5 are left alone.
