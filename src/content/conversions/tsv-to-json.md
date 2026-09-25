---
intro: >-
  The fastest way to turn spreadsheet data into JSON is to copy the cells and paste them here: spreadsheets put
  tab-separated text on the clipboard, and this converter turns it into an array of JSON objects keyed by the header
  row. It works just as well with .tsv exports from databases, BigQuery or scientific tools.


  Numbers and true/false are recognised only when that's lossless, so IDs with leading zeros stay strings. Duplicate or
  blank headers are renamed so every key is unique, and rows with the wrong number of fields are reported. The whole
  conversion runs in your browser.
useCases:
  - title: "Spreadsheet to JSON in seconds"
    text: >-
      Copy a table from Excel or Google Sheets and get JSON for a config file, fixture or API call.
  - title: "Mock data for front-end work"
    text: >-
      Maintain sample content in a spreadsheet and paste it into your app as JSON.
  - title: "Translating tables into i18n files"
    text: >-
      Turn a translation sheet into JSON records for localisation tooling.
  - title: "Converting warehouse exports"
    text: >-
      Tab-delimited query results become JSON for scripts and APIs.
limitations:
  - >-
    Without “Nest dotted column names”, the output is flat: one level of keys per record.
  - >-
    Dates and times stay as text in whatever format the spreadsheet copied.
  - >-
    Formatted numbers such as 1,234.50 or 12% are kept as strings, since the formatting isn't a JSON number.
faq:
  - q: "Can I paste directly from Excel?"
    a: >-
      Yes. Select the cells including the header row, copy, switch to “Paste text” and paste.
  - q: "What if my table has no header row?"
    a: >-
      Turn off “First row contains column names” and you'll get an array of arrays instead of objects.
  - q: "Why are some numbers in quotes?"
    a: >-
      Values are converted to numbers only when the number prints back exactly as written. 007, 1.50 or 1,234 stay as
      text so no information is lost.
  - q: "How are empty cells represented?"
    a: >-
      As empty strings (""). Nothing is guessed or replaced.
---

## Spreadsheet formatting doesn't copy as numbers

What you see in a spreadsheet cell is often a formatted display value: `1,234.50`, `$19.99`, `45%`, `03/04/2026`.
Copying cells copies that display text, not the underlying number. The converter only turns plain numerals into JSON
numbers, so formatted values come through as strings you can clean up deliberately. Setting the column format to plain
“Number” or “Automatic” in your spreadsheet before copying gives cleaner JSON.

## Unique keys

JSON objects can't reliably hold the same key twice, but spreadsheets often have repeated or empty header cells. The
converter renames duplicates (`Price`, `Price_2`) and fills blanks (`column_4`) so every value is kept.
