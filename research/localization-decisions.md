# Localization decisions

Decision labels:

- **IMPLEMENT**: build now.
- **TEST**: build a small set and measure.
- **DEFER**: plausible, but evidence is too thin or the market is too small.
- **REJECT**: not worth doing now.

Evidence is in [`localization-market-analysis.md`](./localization-market-analysis.md) and
[`localized-keywords.csv`](./localized-keywords.csv).

## Selected markets

| Language              | Hreflang | URL prefix | Status    | Pages | Reason |
| --------------------- | -------- | ---------- | --------- | ----- | ------ |
| Bahasa Indonesia      | `id`     | `/id/`     | IMPLEMENT | 10    | Clear gaps for HEIC→PNG and SRT↔VTT; small local sites rank for image queries. The Indonesian pages may also reach Malay searchers (they ranked for the Malay query). |
| Türkçe                | `tr`     | `/tr/`     | IMPLEMENT | 9     | English pages rank for Turkish HEIC queries; subtitle and CSV→JSON queries are poorly served. |
| Tiếng Việt            | `vi`     | `/vi/`     | IMPLEMENT | 7     | Small Vietnamese tools and blogs rank for tool queries; subtitle queries are weak. |
| Português (Brasil)    | `pt`     | `/pt/`     | TEST      | 4     | Only subtitle/data intents: every observed SRT↔VTT result was an English page. HEIC/PDF are saturated, so not built. |

Why language-only hreflang codes (`id`, `tr`, `vi`, `pt`): no research finding separated country variants.
Indonesian is Indonesia; Vietnamese is Vietnam; Turkish is Türkiye. The Portuguese copy is written in Brazilian
Portuguese (the market the research looked at) but reads naturally in Portugal, so `pt` rather than `pt-BR`. A
`pt-BR`/`pt-PT` split can be added later without URL changes if the data justifies it.

## Rejected and deferred markets

| Language          | Status | Reason |
| ----------------- | ------ | ------ |
| Spanish           | DEFER  | HEIC saturated, with advertiser activity observed. The subtitle gap resembles Portuguese; decide after the pt TEST results. |
| Malay             | DEFER  | Indonesian pages already rank for Malay queries. Measure the `/id/` pages' Malaysian impressions first. |
| Hungarian         | DEFER  | Vendor lead-gen SERP is beatable, but a small market with only one intent checked. |
| Czech, Slovak     | DEFER  | Small markets; Czech has a local converter site; Slovak is served by Czech pages. |
| Bulgarian         | DEFER  | Russian/English pages rank, a real gap, but a small market. Good candidate for the next wave. |
| Romanian          | DEFER  | Inconclusive: the research tool does not surface Romanian localized pages (verified by a control query). |
| German, French, Dutch, Polish | REJECT (now) | Saturated by strong localized brands and local specialists for every intent checked. |
| Thai, Greek, Arabic | REJECT (now) | Saturated by localized brands; Arabic also needs RTL layout work. |
| Bengali, Hindi    | REJECT (now) | Queries observed in English or Hinglish, answered by English pages; the English site already fits. |

## Page-level decisions

| Conversion | id | tr | vi | pt | Note |
| ---------- | -- | -- | -- | -- | ---- |
| HEIC → JPG | ✅ | ✅ | ✅ | ✗ saturated | Core iPhone intent |
| HEIC → PNG | ✅ gap | ✅ gap | ✅ | ✗ | |
| HEIC → PDF | ✅ | ✅ | ✗ not researched | ✗ | |
| WebP → JPG | ✅ | ✅ | ✅ | ✗ | |
| WebP → PNG | ✅ | ✗ not researched | ✗ | ✗ | |
| AVIF → JPG | ✅ | ✗ | ✗ | ✗ | |
| PDF → JPG  | ✅ | ✅ | ✅ | ✗ | Saturated; kept for cluster completeness |
| JPG → PDF  | ✅ | ✅ | ✅ | ✗ | Saturated; kept for cluster completeness |
| SRT → VTT  | ✅ gap | ✅ gap | ✅ gap | ✅ gap | Strongest cross-market opportunity |
| VTT → SRT  | ✅ gap | ✅ gap | ✅ | ✅ gap | |
| CSV → JSON | ✗ dev/EN | ✅ gap | ✗ | ✅ | |
| JSON → CSV | ✗ dev/EN | ✗ | ✗ | ✅ | |
| Base64, URL encode/decode | ✗ | ✗ | ✗ | ✗ | Searched in English |

## Slug decisions

Slugs follow the patterns observed in competitor slugs and titles, not a word-for-word translation:

- `id`: `heic-ke-jpg` (same as `smallpdf.com/id/pdf-ke-jpg`, `ilovepdf.com/id/jpg-ke-pdf`)
- `vi`: `heic-sang-jpg` (same as `ilovepdf.com/vi/pdf-sang-jpg`, `iloveimg.com/vi/.../heic-sang-jpg`)
- `tr`: `heic-jpg-cevirme` (same as `ilovepdf.com/tr/pdf-jpg-cevirme`), and `csv-json-donusturme` for the data query
- `pt`: `srt-para-vtt`

## Architecture decisions

1. **English stays at the root** (`/heic-to-jpg/`). The brief showed `/en/...` as an example, but moving live
   English URLs would add redirects and risk for no SEO gain. English is the default and `x-default`, at the root.
   Localized pages live under `/{locale}/`. Easy to reverse: a later move to `/en/` is a routing change plus
   redirects.
2. **Data-driven registry.** `src/data/localized-pages.json` lists which localized pages exist. Localized copy is in
   `src/content/localized/{locale}/{slug}.md`. One template renders every localized tool page. Build-time validation
   ensures every entry has content, points at a real conversion, and has unique slugs, titles and descriptions.
3. **Hreflang only between pages that exist.** Each tool page links to itself, the English page and the other
   localized versions of that conversion. English pages link back. `x-default` points to the English page.
4. **Only the page's own language is shipped.** The converter island bundles English strings. A localized page
   passes only its own dictionary as a prop, so no page loads every language.
5. **Engine messages.** Errors are shown in the page language by error code. Engine-specific technical detail
   (for example a CSV line/column position) stays in English, marked `lang="en"`. This avoids translating
   parser internals into four languages and keeps engines language-neutral.
6. **Policy pages remain English.** Links to them are labelled as English in the localized footer.

## Review triggers

- After 6–8 weeks: check impressions and clicks per localized page in Search Console, grouped by country.
- Promote pt from TEST to IMPLEMENT (more intents) if subtitle pages gain impressions; otherwise remove them
  (delete the JSON entries and Markdown files, and the build drops the pages, hreflang and sitemap entries).
- Next wave candidates: Bulgarian, Spanish subtitles/data, Malay (only if `/id/` doesn't reach Malaysia).
