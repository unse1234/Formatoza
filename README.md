# Formatoza

**Free, private file converters that run in the browser.** 63 conversion pages across images, PDF, data,
developer formats, subtitles and documents. Every file is processed on the visitor's device and never uploaded.
The site is a static Astro build for Cloudflare Pages, with SEO built into the data model and AdSense-ready ad
slots that stay switched off until configured.

The product requirements are in [`converter-site-kit/`](converter-site-kit/). Codebase conventions are in
[`CLAUDE.md`](CLAUDE.md).

---

## Contents

1. [Quick start](#quick-start)
2. [Configuration](#configuration)
3. [Deploying to Cloudflare Pages](#deploying-to-cloudflare-pages)
4. [After launch: Search Console](#after-launch-search-console)
5. [Enabling AdSense](#enabling-adsense)
6. [Architecture](#architecture)
7. [Adding a converter](#adding-a-converter)
8. [Localized pages (international SEO)](#localized-pages-international-seo)
9. [Testing & quality gates](#testing--quality-gates)
10. [Implemented tools](#implemented-tools)
11. [Deferred tools and why](#deferred-tools-and-why)
12. [Known technical limitations](#known-technical-limitations)
13. [Performance](#performance)
14. [SEO checklist](#seo-checklist)
15. [AdSense pre-submission checklist](#adsense-pre-submission-checklist)
16. [Quality audit results](#quality-audit-results)
17. [Third-party licences](#third-party-licences)

---

## Quick start

Requirements: **Node.js 22.12+** (see `.nvmrc`) and npm.

```bash
npm ci
npm run dev            # http://localhost:4321
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (first copies PDF.js data into `public/vendor/pdfjs`) |
| `npm run build` | Static production build into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run verify` | Lint → Prettier check → `astro check` → unit tests → build → site audit |
| `npm run e2e` | Build, then Playwright: every converter end to end, a11y, keyboard, mobile layout, privacy |
| `npm run test` | Vitest unit/SEO tests only |
| `npm run audit:site` | Post-build SEO/performance/Cloudflare audit of `dist/` |
| `npm run fixtures` | Regenerate test fixtures (uses sharp, pdf-lib and optionally Python's pypdf) |
| `npm run brand-assets` | Regenerate icons, `favicon.ico` and the Open Graph image |

End-to-end tests need Chromium: `npx playwright install chromium` (CI does this automatically).

## Configuration

Copy `.env.example` to `.env` for local overrides. Set the same variables in Cloudflare Pages for production.
Every variable is optional.

| Variable | Purpose |
|---|---|
| `PUBLIC_SITE_URL` | Canonical origin, e.g. `https://formatoza.com` (no trailing slash). Used for canonical URLs, the sitemap, Open Graph and `robots.txt`. **Set this before launch.** |
| `PUBLIC_CONTACT_EMAIL` | Address shown on Contact/About/Privacy and in the footer. Defaults to `hello@formatoza.com`. |
| `PUBLIC_ADSENSE_CLIENT` | AdSense publisher ID `ca-pub-…`. Empty = no ad code, script, meta tag or `ads.txt` line anywhere. |
| `PUBLIC_ADSENSE_SLOT_TOOL_AFTER_CONVERTER` | Ad unit ID for the slot below the converter on tool pages. |
| `PUBLIC_ADSENSE_SLOT_TOOL_IN_CONTENT` | Ad unit ID for the slot before the FAQ on tool pages. |
| `PUBLIC_ADSENSE_SLOT_GUIDE_IN_CONTENT` | Ad unit ID for the slot at the end of guides. |
| `PUBLIC_AD_PLACEHOLDERS` | `true` shows labelled grey boxes where ads will go (design review only). |
| `PUBLIC_CF_BEACON_TOKEN` | Optional Cloudflare Web Analytics token (cookieless page views). |

Because these are `PUBLIC_` variables baked in at build time, changing one requires a rebuild or redeploy.

## Deploying to Cloudflare Pages

The site is fully static: no Functions, no database, no server-side processing.

### Option A: Git integration (recommended)

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and select the repo.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables: `NODE_VERSION=22` (Cloudflare also reads `.nvmrc`) and `PUBLIC_SITE_URL=https://your-domain`
4. Deploy. Every push to `main` deploys production; other branches get preview URLs.
5. Under **Custom domains**, add your domain. If it's registered with Cloudflare Registrar, DNS is configured
   automatically.

`npm run build` runs a `prebuild` step that copies the PDF.js CMaps, fonts and WASM decoders into the output, so
nothing needs to be committed for that.

### Option B: direct upload

```bash
npm run build
npx wrangler pages deploy dist --project-name formatoza
```

### What the output contains

- `dist/_headers`: security headers and long-term caching for hashed assets (`/_astro/*` is immutable).
- `dist/404.html`: served automatically by Pages for unknown URLs, with `noindex`.
- `dist/sitemap-index.xml`, `dist/robots.txt`, `dist/ads.txt`, `dist/search-index.json`.
- Trailing-slash URLs (`/heic-to-jpg/`) are canonical. Pages redirects `/heic-to-jpg` to `/heic-to-jpg/` itself.
- About 350 files; the largest is about 2.9 MB (the lazy HEIC decoder). Both are well within the Pages limits of
  20,000 files and 25 MiB per file. `npm run audit:site` checks these limits.

## After launch: Search Console

1. Add the domain property in Google Search Console, verified by a DNS TXT record in Cloudflare.
2. Submit `https://your-domain/sitemap-index.xml`.
3. Use URL Inspection → **Test live URL** on a few tool pages. Check that the rendered HTML contains the H1, the
   content and the FAQ; they are static, so they should.
4. Request indexing for the most important pages (for example `/heic-to-jpg/`, `/webp-to-png/`, `/jpg-to-pdf/`,
   `/pdf-to-png/`, `/csv-to-json/`). Don't mass-request.
5. Weekly, follow the loop in `converter-site-kit/seo.md`: queries with impressions but low CTR → improve the
   title and meta; pages ranking 8–30 → improve content and internal links.

## Enabling AdSense

Nothing is hard-coded. When you're approved:

1. In AdSense, create responsive display units for the placements you want and note their slot IDs.
2. Set `PUBLIC_ADSENSE_CLIENT` and the slot variables in Cloudflare Pages, then redeploy. This adds:
   - `<meta name="google-adsense-account">` on every page (use it for site verification);
   - `ads.txt` with `google.com, pub-…, DIRECT, f08c47fec0942fa0`;
   - Consent Mode v2 defaults (denied in the EEA, UK and Switzerland) **before** the ad script;
   - the AdSense script, loaded after the page is idle or on first interaction, **only on tool pages and guides**;
   - a labelled `Advertisement` unit below the converter and before the FAQ (tool pages), and at the end of guides;
   - a “Privacy choices” button in the footer that reopens the consent message.
3. In AdSense → **Privacy & messaging**, publish a GDPR message (EEA/UK/Switzerland) and, if you want, a US
   state regulations message. Google's certified CMP is served by the AdSense script itself. No extra code is
   needed.
4. Start with the after-converter slot only; add the in-content slot once you have data (see
   `converter-site-kit/adsense-and-policies.md`).

Ads never render inside the converter, next to download buttons, or on the homepage, category hubs, policy pages or
the 404 page. `<AdSlot>` in `src/components/ads/` is the only way to place an ad.

## Architecture

```
src/
├── data/                     # Source of truth (JSON): conversions, categories, supported formats
├── content/                  # Editorial Markdown: conversions/<slug>.md (one per tool), guides/
├── lib/
│   ├── catalog/              # Typed model: registry.ts (validated JSON + derived specs), content.ts (Astro), steps
│   ├── seo/                  # meta.ts (canonical/OG/robots), jsonld.ts (Organization, BreadcrumbList, WebApplication, FAQPage, Article)
│   ├── analytics/            # track() with a strict allow-list: never file names or content
│   ├── consent/              # Consent Mode v2 defaults for Google Privacy & Messaging
│   ├── security/             # DOMPurify sanitiser for any HTML derived from files
│   ├── file/                 # file names, sniffing, text decoding, ZIP, capability checks
│   └── markdown/             # rehype plugin: scrollable, focusable tables/code
├── engines/                  # ConverterEngine implementations (lazy, one chunk each)
│   ├── types.ts              # ConverterEngine / ConversionInput / ConversionResult contract
│   ├── registry.ts           # loadEngine(id): the only entry point for UI code
│   ├── manifest.ts           # which pairs each engine supports (no libraries)
│   ├── options.ts            # declarative settings per conversion (no libraries)
│   ├── image/                # canvas + native decoders; HEIC (heic-to) and TIFF (UTIF) lazily; own ICO/BMP decoders
│   ├── pdf/                  # images→PDF (pdf-lib), PDF→images/text (PDF.js legacy build), all lazy
│   ├── data/                 # CSV/TSV/JSON/XML/YAML/XLSX in a Web Worker (cancel = terminate)
│   ├── text/                 # Markdown/HTML/Base64/URL
│   ├── subtitles/            # own SRT/VTT/ASS parsers and writers
│   └── document/             # DOCX via Mammoth, output sanitised
├── components/
│   ├── converter/            # React island: ConverterShell, Dropzone, FileList, FilePreview, SettingsPanel, ProgressBar, ResultCard…
│   ├── layout/               # Header, Footer, Breadcrumbs, Search, CategoryNav, CategoryPage
│   ├── ui/                   # ToolCard, RelatedTools, FAQ, TrustStrip, FormatCompare, Icon
│   ├── ads/                  # AdSlot, AdSlotPlaceholder
│   └── seo/                  # Seo (head tags), JsonLd
├── layouts/                  # BaseLayout, PolicyLayout
└── pages/                    # [slug].astro (63 tools), 6 category hubs, guides, policy pages, 404, robots.txt, ads.txt, search index
```

**Key decisions**

- **Static HTML first.** Every tool page renders its H1, intro, how-to steps, format explanations, comparison table,
  limits, limitations, use cases, FAQ and related links at build time. The converter island is server-rendered
  too, then hydrated.
- **Engine contract.** UI code calls `loadEngine(id)` and the `ConverterEngine` interface. ESLint rejects any
  import of a conversion library from components or pages.
- **Lazy by construction.** The homepage ships no framework JavaScript. A tool page loads React plus the island
  (about 88 KB gzipped). The engine chunk loads when the visitor interacts, and heavy libraries (PDF.js, the HEIC
  decoder, Mammoth, pdf-lib, the WebP WASM encoder) load only on the code path that needs them.
- **Workers where it matters.** Data conversions run in a Web Worker, so large CSV/JSON files never freeze the page,
  and cancelling terminates the worker immediately. PDF.js parses in its own worker.
- **Fonts** are self-hosted (Geist, OFL). The Latin subset is preloaded; other subsets load only if the page needs
  them.

## Adding a converter

1. Make sure the engine supports the pair (`src/engines/manifest.ts`, plus the implementation in the engine).
2. Add a record to `src/data/conversions.json`: slug, formats, SEO fields, related tools, guide.
3. Add `src/content/conversions/<slug>.md` with a conversion-specific intro, use cases, limitations, FAQ and at
   least one `##` section. The schema is in `src/lib/catalog/content-schema.ts`.
4. Run `npm run verify` and `npm run e2e`. The catalog tests enforce unique titles, meta and H1s, valid links,
   non-duplicated FAQs and a similarity ceiling between pages. The e2e suite automatically covers the new page
   once you add its fixture expectation in `tests/e2e/converters.spec.ts`.

## Localized pages (international SEO)

FormatOza has English at the root plus localized tool pages under `/{locale}/`: Indonesian (`/id/`, 10 pages),
Turkish (`/tr/`, 9), Vietnamese (`/vi/`, 7) and a Portuguese test set (`/pt/`, 4), each with a localized hub page.
The markets were chosen from SERP research documented in [`research/`](research/). Start with
`research/localization-decisions.md`.

How it fits together:

| Piece | Where |
| --- | --- |
| Locales (hreflang, OG locale, native name) | `src/i18n/locales.ts` |
| Which localized pages exist | `src/data/localized-pages.json` (locale → conversion, localized slug, researched keyword) |
| Page copy (title, meta, H1, intro, steps, FAQ…) | `src/content/localized/{locale}/{slug}.md` (schema in `content-schema.ts`) |
| Page chrome (headings, table labels, hub, footer) | `src/i18n/pages.ts` |
| Converter UI dictionaries | `src/i18n/ui/{en,id,vi,tr,pt}.ts` (English is bundled, a localized page passes only its own) |
| Registry, hreflang sets | `src/i18n/registry.ts` |
| Routes | `src/pages/[locale]/index.astro`, `src/pages/[locale]/[slug].astro` |

To add a localized page: add an entry to `localized-pages.json` and write its Markdown file. Settings text is
translated by English source string in the locale's UI dictionary, and the unit tests list any strings that are
missing. Routes, hreflang (pages and sitemap), hub links, related links and the footer update automatically. To
add a language: add it to `locales.ts`, `pages.ts` and `src/i18n/ui/`. To remove a test market, delete its JSON
entries and Markdown files; the build drops its pages, hreflang and sitemap entries.

Only real, working conversions can be localized: the registry throws for unknown conversions, and the e2e suite
converts a real fixture on every localized page.

## Testing & quality gates

| Layer | Where | Covers |
|---|---|---|
| Engine unit tests | `tests/conversion/*.test.ts` (Vitest; jsdom for DOM-based engines) | For every engine: valid sample, empty input, malformed input, large input (50k-row CSV, 5k-cue SRT, 3k-section Markdown), Unicode, multiple files, file-name sanitisation, cancellation |
| Golden fixtures | `tests/fixtures/golden/` | Reviewed expected outputs for representative conversions (CSV→JSON, JSON→CSV, XML→JSON/CSV, YAML, SRT/VTT/ASS/TXT, Markdown/HTML, DOCX) |
| Catalog & SEO | `tests/seo/*.test.ts` | Schema validity, unique titles/meta/H1s/keywords, no near-duplicate pages (4-gram Jaccard < 0.2), no copy-pasted FAQs, valid internal links, analytics privacy |
| Browser e2e | `tests/e2e/converters.spec.ts` | **All 63 converters** convert a real fixture in Chromium; output bytes are checked (magic numbers or expected text); no console errors; **no uploads and no third-party requests during conversion** |
| States & flows | `tests/e2e/flows.spec.ts` | Files picked before hydration, Safari's WASM WebP fallback, paste mode, copy, malformed input, empty/unsupported files, corrupt files, partial failure, encrypted and scanned PDFs, settings, EXIF rotation, ZIP download, reordering, cancellation |
| Accessibility | `tests/e2e/a11y.spec.ts` | axe-core WCAG 2.1 AA on key pages in light and dark mode, results state, keyboard-only flow (skip link, `/` search, converter controls), focus management |
| Layout | `tests/e2e/layout.spec.ts` | Every page at desktop and mobile width: HTTP 200, one H1, no horizontal overflow, no console errors or warnings |
| Build audit | `scripts/audit-site.mjs` | Routes, metadata uniqueness, canonicals, robots, JSON-LD, content in static HTML, 4,700+ internal links, exact sitemap, JS/CSS budgets, Cloudflare limits, no third-party resources |

Fixtures are generated by `scripts/generate-fixtures.mjs`, except `sample.heic`, a real HEIC file from the
[heic2any](https://github.com/alexcorvi/heic2any) project (MIT), since HEVC encoders aren't freely available.

## Implemented tools

63 converters, all running entirely in the browser.

| Category | Converters |
|---|---|
| **Image (22)** | HEIC→JPG, HEIC→PNG, HEIC→WebP, AVIF→JPG, AVIF→PNG, AVIF→WebP, WebP→JPG, WebP→PNG, JPG→PNG, PNG→JPG, JPG→WebP, PNG→WebP, SVG→PNG, SVG→JPG, GIF→JPG, GIF→PNG, BMP→PNG, BMP→JPG, TIFF→JPG, TIFF→PNG, ICO→PNG, ICO→JPG |
| **PDF (7)** | JPG→PDF, PNG→PDF, WebP→PDF, HEIC→PDF, PDF→JPG, PDF→PNG, PDF→WebP |
| **Data (15)** | CSV→JSON, JSON→CSV, CSV→TSV, TSV→CSV, JSON→TSV, TSV→JSON, CSV→XML, XML→CSV, JSON→XML, XML→JSON, JSON→YAML, YAML→JSON, YAML→XML, XML→YAML, CSV→XLSX |
| **Developer (10)** | Markdown→HTML, HTML→Markdown, HTML→Text, Markdown→Text, Text→Base64, Base64→Text, JSON→Base64, Base64→JSON, URL Encode, URL Decode |
| **Subtitles (6)** | SRT→VTT, VTT→SRT, SRT→ASS, ASS→SRT, SRT→TXT, VTT→TXT |
| **Documents (3)** | DOCX→HTML, DOCX→TXT, PDF→Text |

That's all 60 core URLs from `converter-site-kit/conversion-catalog.md`, plus the three document tools the build
brief requires. Notable behaviour:

- **Images:** batch (50 files), quality, resize, background colour for JPG, SVG rendered at 1×/2×/4×/custom width
  (vector-sharp), every page of multi-page TIFFs, the largest or every size of an ICO, first frame of animated
  GIFs with a notice, EXIF orientation applied, EXIF metadata stripped. Safari (no canvas WebP encoder) falls back
  to libwebp WASM.
- **PDF:** JPGs embedded without re-compression; transparency detected and kept losslessly; fit/A4/Letter pages,
  orientation, margins, reordering. PDF→image offers 72/150/300 DPI, page ranges and ZIP download.
  Password-protected and scanned PDFs are explained, not silently failed.
- **Data:** delimiter detection, RFC 4180 quoting, malformed rows kept and reported with line numbers, lossless
  typing (no `007`→`7`), nested dotted columns, record detection in envelopes and JSON Lines, XML attributes/text,
  YAML 1.2 core rules with anchors and merge keys, a hand-written XLSX writer (shared strings, bold and frozen
  header, one sheet per CSV). XML/YAML bombs are refused.
- **Developer:** GFM Markdown with sanitised preview, Turndown with GFM tables, a layout-aware HTML→text walker,
  UTF-8-correct Base64 (URL-safe, MIME wrap, binary detection with file-type sniffing, JWT decoding), strict
  RFC 3986 URL encoding with lenient and repeated decoding.
- **Subtitles:** tolerant parsers (missing counters, CRLF, Windows-1252), tag normalisation, `{\an8}`↔`line:0`,
  timing shift, ASS styles and PlayRes, transcript mode with paragraphing and roll-up de-duplication.

Each tool page also has conversion-specific content: an intro, 1–3 deep-dive sections, a format comparison table,
limits, limitations, use cases and FAQ. There are also 6 category hubs, 8 guides and 7 policy pages.

## Deferred tools and why

| Deferred | Why |
|---|---|
| EPUB → HTML / TXT (catalog items 64–65) | Feasible with fflate plus OPF spine parsing, but it needs testing against representative EPUB 2/3 files, DRM-protected books and fixed-layout books before it can make honest claims. It's the next cheapest cluster to add. |
| PNG/JPG → ICO, JPG/PNG/WebP → AVIF or HEIC, GIF → WebP, TIFF → WebP (catalog expansion) | Encoders are available (ICO trivially; AVIF via libavif WASM, about 1 MB), but the catalog marks them as expansion to add after Search Console shows demand. HEIC encoding has patent and licensing issues. |
| XLSX → CSV/JSON, JSON → XLSX | Reading real-world XLSX (shared formulas, dates, merged cells) needs a full parser (e.g. SheetJS) plus testing on formulas, dates and large files, as the catalog itself requires. |
| PDF → DOCX / XLSX, DOCX/XLSX/PPTX → PDF | Layout-faithful conversion can't be done reliably in a browser, and the requirements explicitly forbid fidelity claims without a trustworthy engine. |
| OCR (scanned PDF → text) | Tesseract WASM is large (several MB plus language data) and slow on phones. It would need its own evaluation and page. |
| Video and audio (MP4→GIF, WAV→MP3…) | FFmpeg WASM is about 30 MB, memory-hungry and above the 25 MiB per-asset limit without splitting. The catalog marks it P2. |
| PDF utilities (merge, split, rotate, compress) | Straightforward with pdf-lib and useful for internal linking, but they aren't conversions. They're the natural next cluster after indexing feedback. |
| More subtitle pairs (VTT→ASS, SBV) | Trivial with the existing engine; held back to keep V1 focused on the highest-intent pages. |

## Known technical limitations

- **Browser memory is the ceiling.** Per-file limits (10–200 MB depending on the tool) keep phones stable. Very
  large images are scaled to fit canvas limits: about 16.7 MP on iOS Safari, 268 MP elsewhere. The tool says so
  when this happens.
- **Colour:** images are drawn through an 8-bit sRGB canvas, so 10-bit, HDR and wide-gamut sources (iPhone P3,
  HDR AVIF) are converted to sRGB. ICC profiles and CMYK fidelity aren't preserved.
- **Metadata:** EXIF, XMP and GPS data isn't copied to outputs. That's documented, and it's a privacy benefit, but
  it can't be switched off.
- **AVIF input** requires a browser with native AVIF decoding (Chrome/Edge 85+, Firefox 93+, Safari 16.4+). Other
  browsers see an explanation up front; there is no WASM AVIF decoder fallback.
- **HEIC:** only the primary image is decoded (no Live Photo video, bursts or depth). Uncommon HEIF variants may
  fail in the libheif build. The decoder downloads about 700 KB in non-Safari browsers.
- **TIFF:** old-style JPEG-in-TIFF, tiled and floating-point TIFFs may not decode; such pages are reported and skipped.
- **SVG:** external images, web fonts and scripts referenced by the SVG are not loaded (security), and text uses
  local fonts.
- **PDF rendering** uses the PDF.js legacy build for compatibility. Rare features (some XFA forms, unusual
  fonts) may render differently from Acrobat. Encrypted PDFs aren't supported, and there's no OCR.
- **PDF → text** follows the PDF's content order, so multi-column layouts can interleave.
- **XML ↔ JSON** has the usual single-versus-list ambiguity, and all XML values are strings.
- **XLSX output** stores dates as text and creates no formulas or formatting beyond the bold, frozen header.
- **HTML/Markdown → HTML output files** contain whatever raw HTML the input had. Only the in-page preview is
  sanitised (DOCX→HTML output is always sanitised).
- **No Content-Security-Policy header yet:** AdSense needs a broad, nonce-based policy that a static site can't
  easily provide. `_headers` sets the other security headers. Add a CSP once the ad setup is final.
- **JavaScript required** for converting. All content pages work without JavaScript.

## Performance

Measured on the production build (gzipped transfer sizes):

| Asset | Size | When it loads |
|---|---|---|
| Homepage HTML | about 9 KB | always (no framework JS; about 3 KB inline search script) |
| CSS (all pages) | about 9 KB | always, cached |
| Geist Latin font | about 29 KB | preloaded, cached |
| React + converter island | about 88 KB | tool pages, on load |
| Data engine worker (PapaParse, fast-xml-parser, js-yaml, XLSX writer) | about 69 KB | first data conversion |
| PDF.js (legacy build + worker) | about 530 KB | first PDF → image/text conversion |
| pdf-lib | about 160 KB | first images → PDF conversion |
| HEIC decoder (libheif) | about 717 KB | first HEIC conversion, and only if the browser can't decode HEIC natively |
| Mammoth (DOCX) | about 115 KB | first DOCX conversion |
| libwebp encoder (WASM) | about 125 KB | only in browsers without canvas WebP encoding (Safari) |

## SEO checklist

Built into the codebase and verified by `npm run audit:site` and the tests:

- [x] One canonical, short, exact-intent URL per conversion (`/heic-to-jpg/`), with a consistent trailing slash
- [x] Unique `<title>`, meta description and H1 on every page (tested)
- [x] Canonical, robots, Open Graph and Twitter tags on every page; the 404 page is `noindex`
- [x] JSON-LD that matches visible content: Organization, WebSite, BreadcrumbList, WebApplication, FAQPage and
  Article, with no invented ratings or reviews
- [x] Sitemap with exactly the 86 canonical indexable pages; `robots.txt` allows everything and points to it
- [x] All key content in static HTML before hydration (checked on every tool page)
- [x] Semantic HTML with breadcrumbs, a table of contents, heading hierarchy, `<details>` FAQ and landmarks
- [x] Internal linking: category hubs, reverse conversion first, 4–8 related tools, a guide per tool, footer
  "popular" links, and a homepage index linking all 63 tools
- [x] Conversion-specific content, with near-duplicate detection in tests
- [x] Fast pages: no framework JS on the homepage, lazy engines, self-hosted fonts, immutable caching
- [x] Clean 404 page with search
- [ ] Set `PUBLIC_SITE_URL` to the real domain and redeploy
- [ ] Verify in Search Console, submit the sitemap, and inspect a few URLs
- [ ] Monitor Core Web Vitals in Search Console, and iterate on titles and meta using real query data
- [ ] Review the Open Graph image (`public/og/default.png`); regenerate with `npm run brand-assets` if the brand
  changes

## AdSense pre-submission checklist

- [x] Real, working product on every indexed page (63 tested converters)
- [x] Original, substantive content per page, plus 8 guides
- [x] Required pages: About, Contact, Privacy policy, Cookie policy, Terms, How it works, Editorial policy
- [x] Clear navigation, a site-wide footer with policy links, contact email and a 404 page
- [x] Ad slots designed in: labelled "Advertisement", visually separated, never inside the converter, never near
  download buttons, not on empty, error-only, policy or 404 pages
- [x] No ad code emitted until `PUBLIC_ADSENSE_CLIENT` is set; `ads.txt` generated from it
- [x] Consent Mode v2 defaults for EEA/UK/CH, compatible with Google Privacy & Messaging; a "Privacy choices" link
- [x] Privacy policy covers local processing, hosting logs, analytics and AdSense (including Google's required
  disclosures and opt-out links)
- [ ] Set `PUBLIC_CONTACT_EMAIL` to a monitored mailbox, and check the About page describes you accurately (it
  currently describes "an independent project")
- [ ] Review the legal pages with your jurisdiction in mind (the terms don't name a governing law)
- [ ] Read through the content once yourself; the editorial policy says pages are human-reviewed
- [ ] Deploy on the final domain, let Google index a meaningful share of pages, then apply
- [ ] After approval: create ad units, set the slot variables, publish the Privacy & Messaging GDPR message, and
  redeploy
- [ ] Start with one placement (after the converter) and add more only if engagement holds

## Quality audit results

Phase 10 of the build brief, as verified on the final build:

| # | Check | Result |
|---|---|---|
| 1 | Build | `npm run build`: 87 pages, no warnings |
| 2 | Tests | 146 unit/SEO tests pass; 261 Playwright tests pass on desktop and mobile Chromium (2 intentionally skipped). The converter and flow suites were repeated 3× with zero flakes. |
| 3 | Lint / typecheck | ESLint 0 problems, Prettier clean, `astro check` 0 errors and 0 warnings, `tsc` clean |
| 4 | All 60+3 URLs | Present, HTTP 200, one H1 each (audit and layout tests) |
| 5 | Every tool works | Each of the 63 pages converts a real fixture in Chromium and output bytes are validated |
| 6 | Unique title/meta/H1 | Enforced by catalog tests and the build audit |
| 7 | Sitemap | Exactly the 86 indexable canonical URLs; 404 excluded |
| 8 | No duplicate routes | Audit fails on unexpected routes; one canonical per page; trailing-slash links only |
| 9 | Mobile layout | No horizontal overflow on any page at 412 px; mobile menu tested |
| 10 | Keyboard accessibility | axe WCAG 2.1 AA clean (light and dark); skip link, `/` search, converter controls and focus-to-results tested |
| 11 | No file content in analytics | `track()` allow-list tested; e2e confirms no uploads or third-party requests during conversion |
| 12 | Console | e2e fails on any console error or warning; none on any page or conversion |
| 13 | Cloudflare Pages | Static output, `_headers`, about 350 files, largest asset about 2.9 MB, no Functions (audited) |

## Third-party licences

Runtime libraries: Astro, React (MIT); PDF.js (Apache-2.0); pdf-lib, PapaParse, fast-xml-parser/-builder/-validator,
js-yaml, marked, Turndown, turndown-plugin-gfm, fflate, UTIF (MIT); Mammoth (BSD-2-Clause); DOMPurify
(Apache-2.0/MPL-2.0); @jsquash/webp and libwebp (Apache-2.0/BSD); Geist fonts (OFL-1.1).

**heic-to bundles libheif and libde265, which are LGPL-3.0.** It's shipped as a separate, dynamically loaded chunk
that users can replace, and it's only fetched when needed. Keep it that way, and keep this notice.
