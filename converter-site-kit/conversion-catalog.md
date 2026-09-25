# Conversion Catalog & Launch Priority

Legend:
- **P0** = launch first
- **P1** = add after first indexing/traffic feedback
- **P2** = technically heavier or lower initial SEO priority

## A. Image format conversions — P0

### High-priority cluster
- HEIC → JPG
- HEIC → PNG
- HEIC → WebP
- AVIF → JPG
- AVIF → PNG
- AVIF → WebP
- WebP → JPG
- WebP → PNG
- JPG → PNG
- PNG → JPG
- JPG → WebP
- PNG → WebP
- SVG → PNG
- SVG → JPG
- GIF → JPG
- GIF → PNG
- BMP → PNG
- BMP → JPG
- TIFF → JPG
- TIFF → PNG
- ICO → PNG
- ICO → JPG

### Expansion
- JPG → AVIF
- PNG → AVIF
- WebP → AVIF
- JPG → HEIC
- PNG → HEIC
- WebP → HEIC
- GIF → WebP
- PNG → GIF
- JPG → GIF
- TIFF → WebP
- AVIF → GIF
- HEIC → AVIF

SEO page rule: each page gets a distinct explanation of format compatibility, transparency, quality, browser support and practical use cases. Do not publish matrix pages just because a pair exists.

## B. PDF ↔ image — P0

- JPG → PDF
- PNG → PDF
- WebP → PDF
- HEIC → PDF
- PDF → JPG
- PDF → PNG
- PDF → WebP
- PDF → TIFF (P1 if reliable)

Related PDF utilities that can increase internal navigation and repeat use:
- Merge PDF
- Split PDF
- Rotate PDF
- Extract PDF pages
- Compress PDF
- PDF to text
- PDF metadata viewer

These are not technically "conversions" but are directly adjacent to search intent.

## C. Structured data conversions — P0

### JSON / CSV
- CSV → JSON
- JSON → CSV
- CSV → TSV
- TSV → CSV
- JSON → TSV
- TSV → JSON
- CSV → XML
- XML → CSV

### JSON / XML
- JSON → XML
- XML → JSON

### JSON / YAML
- JSON → YAML
- YAML → JSON

### YAML / XML
- YAML → XML
- XML → YAML

### Spreadsheet/data
- CSV → XLSX
- XLSX → CSV
- JSON → XLSX
- XLSX → JSON

Only launch spreadsheet conversions after testing large files, formulas, dates, Unicode, nested JSON and malformed CSV.

## D. Markup and developer conversions — P0

- Markdown → HTML
- HTML → Markdown
- HTML → Plain Text
- Markdown → Plain Text
- JSON → Base64
- Base64 → JSON
- Text → Base64
- Base64 → Text
- URL Encode
- URL Decode
- JSON Escape / Unescape
- XML Escape / Unescape
- Text → URL-safe encoding
- Binary → Text
- Text → Binary
- Hex → Text
- Text → Hex

## E. Subtitle / caption conversions — P0/P1

- SRT → VTT
- VTT → SRT
- SRT → ASS
- ASS → SRT
- SRT → TXT
- VTT → TXT
- VTT → ASS
- SBV → SRT
- SRT → SBV

These are cheap to implement because most are structured text transforms.

## F. Document conversions — P1

### DOCX
- DOCX → HTML
- DOCX → TXT
- DOCX → Markdown (via HTML pipeline where appropriate)

### PDF text/markup
- PDF → TXT
- PDF → HTML
- PDF → Markdown

### Text/HTML/PDF
- TXT → PDF
- Markdown → PDF
- HTML → PDF (only after testing browser-side rendering quality)

Do NOT present DOCX → PDF or PDF → DOCX as high-fidelity in V1 unless tested on representative documents.

## G. Ebook conversions — P1/P2

- EPUB → HTML
- EPUB → TXT
- EPUB → ZIP
- EPUB → PDF (technical validation required)
- MOBI → EPUB (complex)
- EPUB → MOBI (complex)
- AZW3 → EPUB (complex)
- PDF → EPUB (complex)

## H. Archive conversions — P1

- ZIP → extracted files
- Folder/files → ZIP
- TAR → extracted files
- TAR → ZIP
- ZIP → TAR
- GZ → extracted file

RAR/7Z should be delayed unless a safe browser-side library and licensing/size constraints are confirmed.

## I. Video — P2

- MP4 → GIF
- MOV → MP4
- WebM → MP4
- MP4 → WebM
- MP4 → MP3
- MOV → MP3
- AVI → MP4
- MKV → MP4
- 3GP → MP4

Reason for P2: browser-side FFmpeg/WebAssembly can be large and memory intensive. Under a no-cost static deployment, it should not block launch.

## J. Audio — P2

- WAV → MP3
- M4A → MP3
- FLAC → MP3
- OGG → MP3
- AAC → MP3
- MP3 → WAV
- MP3 → OGG

Same reason as video: defer the heavy processing engine.

## K. 3D / CAD — P2 / experimental

- STL → OBJ
- OBJ → STL
- GLB → GLTF
- GLTF → GLB
- 3MF → STL
- DXF → SVG

These are interesting for SEO but need much more validation before becoming part of a zero-cost v1.

## Launch shortlist: first ~60 URLs

### Image — 22
1. heic-to-jpg
2. heic-to-png
3. heic-to-webp
4. avif-to-jpg
5. avif-to-png
6. avif-to-webp
7. webp-to-jpg
8. webp-to-png
9. jpg-to-png
10. png-to-jpg
11. jpg-to-webp
12. png-to-webp
13. svg-to-png
14. svg-to-jpg
15. gif-to-jpg
16. gif-to-png
17. bmp-to-png
18. bmp-to-jpg
19. tiff-to-jpg
20. tiff-to-png
21. ico-to-png
22. ico-to-jpg

### PDF/image — 7
23. jpg-to-pdf
24. png-to-pdf
25. webp-to-pdf
26. heic-to-pdf
27. pdf-to-jpg
28. pdf-to-png
29. pdf-to-webp

### Data — 15
30. csv-to-json
31. json-to-csv
32. csv-to-tsv
33. tsv-to-csv
34. json-to-tsv
35. tsv-to-json
36. csv-to-xml
37. xml-to-csv
38. json-to-xml
39. xml-to-json
40. json-to-yaml
41. yaml-to-json
42. yaml-to-xml
43. xml-to-yaml
44. csv-to-xlsx

### Developer/text — 10
45. markdown-to-html
46. html-to-markdown
47. html-to-text
48. markdown-to-text
49. text-to-base64
50. base64-to-text
51. json-to-base64
52. base64-to-json
53. url-encode
54. url-decode

### Subtitle — 6
55. srt-to-vtt
56. vtt-to-srt
57. srt-to-ass
58. ass-to-srt
59. srt-to-txt
60. vtt-to-txt

### Document/text — 5 optional P0/P1
61. docx-to-html
62. docx-to-txt
63. pdf-to-text
64. epub-to-html
65. epub-to-txt

Total: 60 core pages + 5 optional early pages.
