---
intro: >-
  Opening a CSV in Excel is surprisingly destructive: leading zeros vanish from ZIP codes and phone numbers, long IDs
  turn into scientific notation, and accented characters can be garbled. Converting to a real XLSX workbook first
  avoids that, because each cell is stored with an explicit type. This converter writes numbers as numbers only when
  that's lossless and keeps everything else — 02134, +44 20 7946 0958, 16-digit account numbers — as text.


  The header row is bold and frozen, column widths are sized to the content, and several CSV files can go into one
  workbook with one sheet each. The workbook is generated in your browser; no data is uploaded.
useCases:
  - title: "Sharing data with Excel users"
    text: >-
      Send a workbook that opens correctly with a double-click, no import wizard.
  - title: "Preserving IDs and codes"
    text: >-
      Keep leading zeros and long numeric identifiers exactly as they are.
  - title: "Combining exports into one file"
    text: >-
      Merge several CSV exports into one workbook with a sheet per file.
  - title: "Reports for non-technical colleagues"
    text: >-
      A frozen, bold header row makes raw exports immediately usable.
limitations:
  - >-
    Dates are kept as text exactly as written, because a CSV doesn't say whether 03/04 is March 4 or April 3. Convert
    them in Excel with Text to Columns or DATEVALUE if needed.
  - >-
    Formulas are not created; a value like =SUM(A1:A3) is stored as text, not evaluated.
  - >-
    Numbers with more than 15 significant digits are stored as text, because Excel can't represent them exactly.
  - >-
    No cell formatting beyond the bold header row: no currency formats, colors or column filters.
  - >-
    Excel's limits apply: 1,048,576 rows and 16,384 columns per sheet, 32,767 characters per cell (longer values are
    truncated with a warning).
faq:
  - q: "Why do my ZIP codes lose their leading zero when I open a CSV in Excel?"
    a: >-
      Excel guesses that 02134 is a number and stores 2134. In the XLSX produced here, values that wouldn't survive as
      numbers are stored as text, so the zero stays.
  - q: "Can I put several CSV files in one workbook?"
    a: >-
      Yes. Add several files and keep “One workbook, one sheet per file” in Settings. Sheet names come from the file
      names, shortened to Excel's 31-character limit.
  - q: "Does it work with semicolon-separated CSVs?"
    a: >-
      Yes. The delimiter is detected automatically, or you can choose it in Settings.
  - q: "Will it open in Google Sheets and LibreOffice?"
    a: >-
      Yes. The file is standard Office Open XML (.xlsx), which Google Sheets, LibreOffice Calc and Apple Numbers all
      read.
---

## How Excel mangles CSV — and how XLSX avoids it

When Excel opens a CSV it has to guess every cell's type. It strips leading zeros (`00123` → `123`), shows long numbers
in scientific notation and silently rounds anything beyond 15 significant digits (`4111111111111111` becomes
`4111111111111110`), and reinterprets things that look like dates — which is how gene names like SEPT2 and MARCH1
famously turned into dates in published research. In an XLSX file every cell declares its type, so there's nothing
to guess.

## The typing rules used

A value is written as a number only if all of these hold:

- it's a plain numeral like `42`, `-7` or `3.14`;
- it prints back exactly the same (so `3.10`, `1e5`, `+44` and `007` stay text);
- it has at most 15 significant digits, Excel's precision limit.

`true` and `false` become Excel booleans. Everything else, including dates, is stored as text.

## What's in the file

The workbook is a standard Office Open XML package: shared strings, one worksheet per CSV, a minimal stylesheet for
the bold header, and a frozen top row. Column widths are estimated from the longest value in each column, capped so
one long description doesn't create a huge column.
