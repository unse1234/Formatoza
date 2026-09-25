---
intro: >-
  When you copy cells from Excel, Google Sheets or a database client, the clipboard holds tab-separated text. Many
  data exports — bioinformatics tables, BigQuery extracts, log analysers — also produce TSV. But most import forms,
  libraries and business tools want proper CSV. This converter turns TSV into standard RFC 4180 CSV, quoting any value
  that contains a comma, quote or line break so nothing splits into the wrong column.


  Paste spreadsheet cells directly or drop .tsv/.tab/.txt files. You can choose comma or semicolon output and add a
  UTF-8 byte-order mark for Excel. Everything runs in your browser.
useCases:
  - title: "Spreadsheet selections to CSV"
    text: >-
      Copy a range of cells, paste it here and get a CSV file without an export dialog.
  - title: "Importing into web apps"
    text: >-
      CRMs, email platforms and e-commerce tools usually import CSV only.
  - title: "Sharing research data"
    text: >-
      Convert tab-delimited scientific outputs for collaborators using CSV-based tools.
  - title: "Preparing database loads"
    text: >-
      Produce a properly quoted CSV for tools that don't accept tabs.
limitations:
  - >-
    Tab characters inside values can't be distinguished from delimiters in unquoted TSV; if your source has them, the
    columns will shift.
  - >-
    Values are copied as text exactly; no numbers, dates or booleans are reformatted.
  - >-
    Rows with inconsistent field counts are padded or extended and listed in the results.
faq:
  - q: "Can I paste cells straight from Excel or Google Sheets?"
    a: >-
      Yes. Choose “Paste text”, paste, and the CSV appears as you type. Spreadsheets copy selections as tab-separated
      text.
  - q: "Which values get quoted?"
    a: >-
      Only values containing a comma, a double quote or a line break. Quotes inside values are doubled, as RFC 4180
      requires.
  - q: "How do I make Excel open the CSV correctly?"
    a: >-
      Enable “Add UTF-8 BOM for Excel” so accented characters display properly, and choose the semicolon delimiter if
      your Excel uses a comma as the decimal separator.
  - q: "Is my data sent anywhere?"
    a: >-
      No. Parsing and writing happen inside your browser tab.
---

## RFC 4180 in one paragraph

The closest thing CSV has to a standard is RFC 4180 (2005): records separated by line breaks (CRLF), fields separated
by commas, and any field containing a comma, a double quote or a line break enclosed in double quotes, with embedded
quotes doubled. `He said "hi", then left` becomes `"He said ""hi"", then left"`. The output of this converter follows
exactly those rules, which is what virtually every CSV importer expects.

## Commas or semicolons?

Excel decides how to split a CSV using the system's list separator. In locales where the comma is the decimal mark —
much of Europe and South America — that separator is a semicolon, and a comma-separated file opens as a single column.
If that happens to your recipients, choose the semicolon output delimiter.
