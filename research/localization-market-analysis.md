# Localization market analysis

Research date: 2026-09-25. Scope: 20 languages, 56 recorded searches across image, PDF, subtitle, data and
developer conversions. The raw rows are in [`localized-keywords.csv`](./localized-keywords.csv) and the resulting
decisions are in [`localization-decisions.md`](./localization-decisions.md).

## 1. Method and its limits (read this first)

| Source requested                          | Status in this environment                                                       |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| Google Search (localized SERP)            | **Blocked.** The egress proxy returned 403 for `www.google.com`.                 |
| Google autocomplete                       | **Blocked** (`suggestqueries.google.com`, 403).                                  |
| Google Trends                             | **Blocked** (`trends.google.com`, 403).                                          |
| Google Keyword Planner                    | **Unavailable.** Needs an Ads account and a browser session.                     |
| Ahrefs / Semrush free tools               | **Blocked** (`ahrefs.com` 403) or needs a login.                                 |
| Competitor pages (iloveimg, etc.)         | **Blocked** for direct fetching.                                                 |
| Web search tool (US-located index)        | **Used.** It returns the top ~9 organic results with titles and URLs.            |

What this means:

- **No search volume, CPC, keyword difficulty or Ads competition value was observed.** Every such column in the
  CSV reads `unavailable`. Nothing was estimated.
- **The SERPs are proxies.** They come from a US-located index queried in the local language, not from
  google.co.id, google.com.vn and so on. Rankings in the real local SERP will differ. What the proxy does show
  reliably is:
  1. **Whether dedicated, localized converter pages exist.** When localized brand pages are in the index, they
     show up for local-language queries. Indonesian, Vietnamese, Thai, Greek, Arabic and Turkish all behaved this
     way.
  2. **Which competitors cover each language.** Their page titles and slugs also show how the query is phrased
     (for example `ilovepdf.com/tr/pdf-jpg-cevirme` and `smallpdf.com/id/pdf-ke-jpg`).
  3. **Whether the intent is poorly served.** Signs are Wikipedia disambiguation pages, wrong-intent pages, blogs
     or English-only tools ranking for a local-language tool query.
- **Romanian was inconclusive.** A site-restricted control query found none of the localized brand pages that
  are known to exist, so "no Romanian pages found" is treated as a limitation of the tool, not as evidence of a
  gap.
- "SEO competition" in the CSV is a **qualitative reading of the observed result set** (weak / medium / strong).
  It is not a tool metric. Advertiser competition is kept separate: the only advertiser evidence observed was Google
  Ads click parameters (`gad_source`, `gad_campaignid`) on a FreeConvert result for the Spanish HEIC→JPG query.
  That shows advertisers are active on that query. It gives no CPC and says nothing about how hard the query is
  for SEO.

**Recommended follow-up with real data:** before expanding further, run the selected keywords through Keyword
Planner (location: Indonesia, Vietnam, Türkiye, Brazil) and check Search Console impressions for the new pages
after 6–8 weeks. The decisions below are designed to be cheap to reverse.

## 2. Markets investigated

| Lang | Market     | Queries | What the observed SERPs showed                                                                                              | Decision      |
| ---- | ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------- | ------------- |
| id   | Indonesia  | 14      | Image/PDF tool queries: localized international brands, but a small local site (se-hari.com) ranks for WebP. HEIC→PNG and VTT→SRT: no Indonesian page at all. SRT→VTT: one exact-match page plus Wikipedia/blog noise. | **IMPLEMENT** |
| vi   | Vietnam    | 7       | Brands present, but small Vietnamese tools and retailer blogs rank for tool queries (tienichai.com, tools.vsm.vn, cellphones.com.vn, thegioididong.com). Subtitle queries are weak. | **IMPLEMENT** |
| tr   | Türkiye    | 9       | HEIC→JPG/PNG: 5 of 9 results were English pages ranking for a Turkish query. SRT/VTT: Wikipedia and a subtitle *translator* (wrong intent). CSV→JSON: 8 of 9 English. PDF/WebP queries are saturated. | **IMPLEMENT** |
| pt   | Brazil     | 6       | HEIC/PDF saturated. Subtitle queries: 9 of 9 results English for both directions. Data queries mostly English.               | **TEST** (4 pages) |
| es   | ES/LatAm   | 3       | HEIC saturated, with advertiser activity observed. Subtitle/data queries partly localized by small tools.                   | DEFER         |
| ms   | Malaysia   | 1       | Indonesian pages rank for the Malay query.                                                                                    | DEFER         |
| hu   | Hungary    | 1       | Mostly software-vendor lead-gen pages: beatable, but a small market with only one intent checked.                            | DEFER         |
| cs   | Czechia    | 1       | Vendor pages plus one local site.                                                                                            | DEFER         |
| sk   | Slovakia   | 1       | Only Czech-language results. Underserved but very small, and Czech pages are widely read.                                   | DEFER         |
| bg   | Bulgaria   | 1       | iLoveIMG/PDF24 in Bulgarian, then Russian and English pages. A localization gap, but a small market.                        | DEFER         |
| ro   | Romania    | 2       | Inconclusive (research-tool limitation, see §1).                                                                             | DEFER         |
| de   | Germany    | 2       | HEIC saturated, including strong local sites. Subtitles partly localized.                                                   | REJECT (now)  |
| fr   | France     | 1       | Saturated.                                                                                                                   | REJECT (now)  |
| nl   | NL/BE      | 1       | Saturated.                                                                                                                   | REJECT (now)  |
| pl   | Poland     | 1       | Saturated, including a local specialist (konwerter-online.pl).                                                              | REJECT (now)  |
| th   | Thailand   | 1       | Saturated by localized brands (iLoveIMG, PDF24, WPS, Canva, Fotor).                                                          | REJECT (now)  |
| el   | Greece     | 1       | Saturated by localized brands.                                                                                               | REJECT (now)  |
| ar   | Arabic     | 1       | Saturated by localized brands; would also need RTL work.                                                                     | REJECT (now)  |
| bn   | Bangladesh | 1       | No Bengali pages; English pages served. Demand in Bengali script unverified.                                                | REJECT (now)  |
| hi   | India      | 1       | Hinglish query served by English pages; the English site already matches.                                                  | REJECT (now)  |

## 3. Cross-market findings

1. **The biggest intents are locked by localized brands everywhere.** HEIC→JPG, PDF→JPG, JPG→PDF and WebP→JPG
   are covered in almost every language by iLoveIMG/iLovePDF, Smallpdf, PDF24, Adobe, Canva and Convertio. Their
   slugs and titles match the local query exactly (`/id/pdf-ke-jpg`, `/tr/pdf-jpg-cevirme`, `/vi/pdf-sang-jpg`).
   Beating them requires authority FormatOza doesn't have yet. These pages are still built in the selected
   markets because they share the same working tool, complete the internal-link cluster, and are what users of
   those markets expect to find. They are not expected to win quickly.
2. **Second-tier intents are poorly served, even in large languages.** For SRT↔VTT, the observed results were:
   - Indonesian: Wikipedia disambiguation pages, a Google Translate proxy page and a blog.
   - Turkish: Wikipedia and a subtitle *translator*.
   - Portuguese: 9 of 9 English pages.
   - Vietnamese: only small tools.

   HEIC→PNG in Indonesian and Turkish shows the same pattern: English pages ranking for local queries. FormatOza's
   subtitle and image engines already handle these conversions, so these are the strongest SEO opportunities.
3. **Developer tools are searched in English.** Base64, URL-encode and JSON→CSV queries in Indonesian returned
   only English developer tools. Localizing them adds little. They are rejected or deferred, except Turkish
   CSV→JSON (no Turkish page observed) and the Portuguese data TEST.
4. **Small local sites rank in Indonesian and Vietnamese.** se-hari.com, tienichai.com, tools.vsm.vn and retailer
   blogs rank in the top 9 for tool queries. The SERP is not fully closed to newcomers.
5. **Natural keyword patterns** come from competitor titles and slugs, not from translation:
   - Indonesian: `X ke Y`, with `ubah` / `konversi` / `online gratis`.
   - Vietnamese: `chuyển X sang Y`; `ảnh sang pdf` for photos.
   - Turkish: `X Y çevirme` (the keyword used as the slug by iLovePDF), with `dönüştür` in body copy.
   - Portuguese: `converter X para Y`.

   In all four, format names stay in English/uppercase (HEIC, JPG, SRT).

## 4. Competitors to know

| Competitor                    | Where it shows up                                   | Strength                                  |
| ----------------------------- | --------------------------------------------------- | ----------------------------------------- |
| iLoveIMG / iLovePDF           | Localized in every tested language except bn/hi/ro  | Very strong; exact-match localized slugs  |
| Smallpdf, Adobe Acrobat/Express, Canva | PDF and HEIC queries in most languages     | Very strong domains                       |
| PDF24                         | id, th, el, bg, tr, pt, de                          | Strong, localized                         |
| Convertio, CloudConvert, FreeConvert, AnyConv | Almost everywhere                   | Strong; often only partly localized       |
| VEED, HappyScribe, Maestra, GoTranscript | Subtitle queries                         | Strong domains, mostly English pages      |
| Local small sites (se-hari.com, tienichai.com, tools.vsm.vn, webolizma.com) | id, vi, tr | Weak, but they rank |

## 5. Strongest opportunities (implemented)

| Market | Conversion | Localized keyword (observed pattern) | Why                                                   |
| ------ | ---------- | ------------------------------------ | ----------------------------------------------------- |
| id     | VTT → SRT  | vtt ke srt                           | No Indonesian page observed                           |
| id     | SRT → VTT  | ubah srt ke vtt                      | Wikipedia/blog noise; one exact-match competitor      |
| id     | HEIC → PNG | heic ke png                          | No Indonesian page observed                           |
| tr     | SRT → VTT  | srt vtt çevirme                      | Wikipedia + wrong-intent translator                   |
| tr     | VTT → SRT  | vtt srt çevirme                      | Wikipedia-heavy                                       |
| tr     | HEIC → JPG | heic jpg çevirme                     | 5 of 9 English pages                                  |
| tr     | HEIC → PNG | heic png çevirme                     | 5 of 9 English pages                                  |
| tr     | CSV → JSON | csv json dönüştürme                  | 8 of 9 English pages                                  |
| vi     | SRT → VTT  | chuyển file srt sang vtt             | Small tools only                                      |
| vi     | HEIC → JPG | chuyển heic sang jpg                 | Small local tool + blog rank                          |
| pt     | SRT ↔ VTT  | converter srt para vtt / vtt para srt | 9 of 9 English pages (TEST)                          |

## 6. Page counts per selected market

| Market | Status    | Pages | Conversions                                                                    |
| ------ | --------- | ----- | ------------------------------------------------------------------------------ |
| id     | IMPLEMENT | 10    | HEIC→JPG, HEIC→PNG, HEIC→PDF, WebP→JPG, WebP→PNG, AVIF→JPG, PDF→JPG, JPG→PDF, SRT→VTT, VTT→SRT |
| tr     | IMPLEMENT | 9     | HEIC→JPG, HEIC→PNG, HEIC→PDF, WebP→JPG, PDF→JPG, JPG→PDF, SRT→VTT, VTT→SRT, CSV→JSON |
| vi     | IMPLEMENT | 7     | HEIC→JPG, HEIC→PNG, WebP→JPG, PDF→JPG, JPG→PDF, SRT→VTT, VTT→SRT                |
| pt     | TEST      | 4     | SRT→VTT, VTT→SRT, CSV→JSON, JSON→CSV                                            |

That is 30 localized tool pages plus 4 localized hub pages (`/id/`, `/tr/`, `/vi/`, `/pt/`). Everything else
stays English-only.

## 7. Conversions researched but not in the FormatOza catalog

The brief asked about JSON→XLSX, XLSX→CSV, JSON/XML escape/unescape, Hex↔Text, Binary↔Text and SBV→SRT. None of
these exists in FormatOza, so **no localized page was created for them**: pages may only describe working tools.
Their English demand should be validated before any engine work. They are not part of this localization.
