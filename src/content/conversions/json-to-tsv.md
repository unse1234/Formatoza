---
intro: >-
  TSV is the quickest way to get JSON data into a spreadsheet: paste tab-separated text into Excel or Google Sheets and
  it lands in the right cells instantly, no import wizard needed. It's also the friendliest table format for
  command-line tools. This converter flattens JSON records into a TSV table, turning nested objects into dotted columns
  and collecting every key into the header.


  It accepts arrays of objects, objects that wrap an array (like API responses), and JSON Lines. Paste JSON, copy the
  TSV result, and paste it into your sheet — or download a .tsv file. All processing happens locally.
useCases:
  - title: "API data into Google Sheets"
    text: >-
      Copy the TSV output and paste into a sheet; every field lands in its own column.
  - title: "Shell pipelines"
    text: >-
      Produce tab-separated rows for awk, cut, sort or a database bulk load.
  - title: "Quick data review"
    text: >-
      Eyeball JSON records as a table without writing a script.
  - title: "Loading into analytics tools"
    text: >-
      Many analytics and warehouse loaders accept tab-delimited input.
limitations:
  - >-
    Arrays inside records are written as JSON text in one cell.
  - >-
    Values containing tabs or line breaks are quoted; some strict TSV readers don't support quotes.
  - >-
    Very heterogeneous records produce wide, sparse tables.
faq:
  - q: "How do I paste the result into a spreadsheet?"
    a: >-
      Click Copy in the result panel, click a cell in Excel or Google Sheets, and paste. Tab-separated text is split into
      columns automatically.
  - q: "What happens to nested objects?"
    a: >-
      They become dotted column names such as address.city. Disable flattening to keep them as JSON text.
  - q: "Does it support JSON Lines?"
    a: >-
      Yes. If the input has one JSON object per line, each line becomes a row.
  - q: "Why is my column order different from the JSON?"
    a: >-
      Columns follow the order in which keys first appear across all records, so keys that only exist in later records
      appear at the end.
---

## Why TSV pastes perfectly into spreadsheets

When you copy cells in a spreadsheet, the clipboard receives the selection as plain text with tabs between cells and
line breaks between rows. Pasting reverses the process. That makes TSV the de facto clipboard format for tables: no
delimiter guessing, no locale issues with commas and semicolons, no import dialog.

## The flattening rules

Records are located the same way as in JSON to CSV: a top-level array, the largest array of objects nested inside an
object, or JSON Lines. Nested objects become dotted columns, arrays become JSON text, `null` becomes an empty cell. The
same data converted to CSV and TSV produces identical tables; only the delimiter and quoting differ.
