---
intro: >-
  Tab-separated values are easier to process than CSV in many tools — Unix cut and awk, bioinformatics pipelines,
  BigQuery and Hive loads, pasting into a spreadsheet — because tabs almost never occur inside real data, so fields
  rarely need quoting. Converting CSV to TSV is not as simple as replacing commas with tabs, though: commas inside
  quoted values must survive, and quoted line breaks must stay in one field.


  This converter parses the CSV properly (auto-detecting comma, semicolon or pipe delimiters), then writes each field
  separated by tabs, quoting only fields that contain tabs, quotes or line breaks. It works on pasted text and files, in
  your browser.
useCases:
  - title: "Command-line processing"
    text: >-
      TSV works cleanly with cut -f, awk -F'\t', sort and join.
  - title: "Loading into data warehouses"
    text: >-
      BigQuery, Redshift and Hive loads are often configured for tab-delimited files.
  - title: "Pasting into spreadsheets"
    text: >-
      Tab-separated text pastes directly into Excel or Google Sheets cells without an import wizard.
  - title: "Bioinformatics and research tools"
    text: >-
      Many scientific tools read tab-delimited tables by convention.
limitations:
  - >-
    Values that themselves contain tabs or line breaks are quoted in the output. Some strict TSV readers don't support
    quoting; clean those values first if your tool can't handle them.
  - >-
    All values are written exactly as text; no type conversion is performed.
  - >-
    Rows with a different number of fields than the header are padded or extended and reported.
faq:
  - q: "Why not just replace commas with tabs?"
    a: >-
      Because commas can appear inside quoted values ("Paris, France"). A naive replacement splits those values across
      columns. Parsing the CSV first keeps every field intact.
  - q: "Are quotes removed?"
    a: >-
      Yes, CSV quoting is removed where it's no longer needed. A field is quoted in the TSV only if it contains a tab,
      a double quote or a line break.
  - q: "Does it handle semicolon-separated files?"
    a: >-
      Yes. The input delimiter is detected automatically, or you can set it in Settings.
  - q: "Is the header row kept?"
    a: >-
      Yes. The first row is written unchanged, whatever its content.
---

## CSV quoting versus TSV simplicity

CSV needs a quoting mechanism because commas are common in real text — addresses, names, descriptions. TSV avoids the
problem by choosing a delimiter that almost never appears in data. The IANA definition of
`text/tab-separated-values` actually forbids tabs inside fields and has no quoting at all; in practice, most modern
tools accept CSV-style quotes in TSV files as a fallback. This converter produces clean, unquoted TSV whenever the data
allows it and falls back to quoting only for the rare fields that need it.

## Line endings and encoding

Output uses Windows-style CRLF line endings, which every spreadsheet and most command-line tools accept, and UTF-8
encoding so accented letters, CJK characters and emoji are preserved.
