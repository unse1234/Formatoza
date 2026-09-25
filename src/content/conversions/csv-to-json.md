---
intro: >-
  CSV is how data leaves spreadsheets and databases; JSON is how APIs, JavaScript apps and document databases want to
  receive it. This converter turns each CSV row into a JSON object keyed by the header row, producing an array of
  objects you can paste straight into code, a fixture file, a MongoDB import or an API request.


  It follows the RFC 4180 rules for quoted fields, detects comma, semicolon, tab and pipe delimiters automatically, and
  converts numbers and booleans only when that is lossless — ZIP codes like 02134 stay strings. Rows with too few or too
  many fields are kept and reported rather than silently dropped. Paste CSV or drop files; everything runs in your
  browser.
useCases:
  - title: "Seeding apps and tests"
    text: >-
      Turn a spreadsheet of sample records into JSON fixtures for unit tests or a development database.
  - title: "Importing into document databases"
    text: >-
      MongoDB, Firestore and CouchDB imports expect JSON documents, not CSV rows.
  - title: "Feeding APIs"
    text: >-
      Convert exported rows into the JSON body an API endpoint or webhook expects.
  - title: "Front-end data files"
    text: >-
      Generate static JSON for charts, maps or tables in a website without a backend.
limitations:
  - >-
    CSV has no nesting. Nested JSON is only produced if you enable “Nest dotted column names”, which turns columns such
    as address.city into nested objects.
  - >-
    Dates stay as strings exactly as written — CSV gives no reliable way to know which format a date uses.
  - >-
    Values become numbers only when the conversion is lossless, so 1.50, 1e3, +44 and very long IDs remain strings.
    This is deliberate but may differ from what a spreadsheet displays.
  - >-
    Empty cells become empty strings (""), not null, so no information is invented.
  - >-
    Files up to 60 MB are supported; very large files are processed in a background worker but still need enough device
    memory for the whole result.
faq:
  - q: "What does the JSON output look like?"
    a: >-
      With a header row, an array of objects: [{"id": 1, "name": "Ana"}, …]. Without a header row (switch it off in
      Settings), an array of arrays, one per line.
  - q: "How are commas inside values handled?"
    a: >-
      Values containing commas, quotes or line breaks must be wrapped in double quotes in the CSV, with quotes doubled
      (""), as RFC 4180 specifies. The parser handles all of these, including line breaks inside a quoted cell.
  - q: "My CSV uses semicolons. Will it work?"
    a: >-
      Yes. The delimiter is detected automatically from the data, and you can force comma, semicolon, tab or pipe in
      Settings. Semicolons are standard in CSVs exported by Excel in many European locales.
  - q: "What happens to duplicate or empty column names?"
    a: >-
      JSON keys must be unique, so duplicates get a suffix (name, name_2) and empty headers become column_1, column_2 and
      so on.
  - q: "Why is my number still a string?"
    a: >-
      Numbers are only converted if they print back identically, so no data changes. Leading zeros, trailing zeros,
      plus signs, exponents and integers too large for JavaScript to represent exactly all stay as strings.
---

## Rows become objects, headers become keys

A CSV file is a grid; JSON is a tree. The standard mapping — and the one used here — treats the first row as field
names and every following row as one record:

```
id,name,active          [
1,Ana,true         →      { "id": 1, "name": "Ana", "active": true },
2,"Lee, Min",false        { "id": 2, "name": "Lee, Min", "active": false }
                        ]
```

Turn off “First row contains column names” and each line becomes an array instead, which preserves the exact grid
when the file has no header.

## Delimiters and quoting

“Comma-separated” is more of a family than a format. Excel in Germany, France or Brazil writes semicolons because the
comma is the decimal separator; exports from databases often use tabs or pipes. The converter samples the data to pick
the delimiter that produces consistent columns, and tells you when it chose something other than a comma. Quoted
fields may contain delimiters and even line breaks, which is why the file is parsed properly rather than split on
commas.

## Malformed rows are reported, not dropped

Real-world CSVs are messy: a row with a missing value, an extra comma, a quote that never closes. Instead of
discarding such rows, the converter keeps every row, pads short rows with empty values, stores extra values in added
columns (`column_7`, …), and lists the affected line numbers so you can check them. An unclosed quote swallows the
rest of the file into one field, so that case is flagged prominently.

## Nested data

JSON can nest; CSV can't. If your columns use dotted names — `address.city`, `address.zip` — enable “Nest dotted column
names” to rebuild `{ "address": { "city": …, "zip": … } }`. That's the inverse of what the JSON to CSV converter does
when it flattens objects. Arrays can't be expressed in CSV columns at all, so they are not reconstructed.
