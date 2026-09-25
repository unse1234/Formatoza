# Localization implementation report

Date: 2026-09-25. Companion files:

- [`localization-market-analysis.md`](./localization-market-analysis.md): evidence
- [`localization-decisions.md`](./localization-decisions.md): decisions
- [`localized-keywords.csv`](./localized-keywords.csv): raw observations

## What was shipped

| Market            | Status    | URL prefix | Tool pages | Hub  |
| ----------------- | --------- | ---------- | ---------- | ---- |
| Indonesian        | IMPLEMENT | `/id/`     | 10         | `/id/` |
| Turkish           | IMPLEMENT | `/tr/`     | 9          | `/tr/` |
| Vietnamese        | IMPLEMENT | `/vi/`     | 7          | `/vi/` |
| Portuguese (BR)   | TEST      | `/pt/`     | 4          | `/pt/` |

That is 30 localized tool pages and 4 hubs. The build grew from 87 to 121 pages. The English URLs are unchanged.

Every localized page exposes the same working converter as its English page. Each one carries:

- its own title, meta description and H1, containing the researched keyword
- a localized short description and intro
- localized "how to" steps that match the localized button labels
- source and target format explanations
- use cases for the local market (e-Devlet forms in Turkish, CCCD documents and Zalo in Vietnamese,
  administrative uploads in Indonesian, Excel's semicolon CSV in Turkish and Portuguese)
- limitations and FAQs rewritten from the tested behaviour (no new claims), plus language-specific FAQs where
  real questions differ. Examples: Vietnamese TCVN3/VNI subtitle encodings (the tool can't fix them, and says so),
  Turkish Windows-1254 characters, the Turkish meaning of "çevirme" (convert vs translate), and "HEIC to JPG on
  a laptop without an app" (an observed Indonesian informational query).

## Architecture

| Concern | Implementation |
| --- | --- |
| Locales | `src/i18n/locales.ts`: en (default, root), id, vi, tr, pt; hreflang, OG locale, native names |
| Page registry | `src/data/localized-pages.json` → `src/i18n/registry.ts` (validated at import: known locale, real conversion, unique slug, keyword present) |
| Content | Content collection `localized` (`src/content/localized/{locale}/{slug}.md`) with a strict schema (`localizedConversionSchema`) |
| Page chrome | `src/i18n/pages.ts` (headings, limit table, trust strip, lazy-asset notes, hub, footer, breadcrumb label) |
| Converter UI | `src/i18n/ui/*.ts` dictionaries + `src/components/converter/i18n.ts` (context, `fmt`, `plural` via `Intl.PluralRules`, settings translation, progress/detail mapping, error-by-code) |
| Routes | `src/pages/[locale]/[slug].astro` (one template for all tool pages), `src/pages/[locale]/index.astro` (hubs) |
| hreflang | `conversionAlternates()` / `homeAlternates()` → `<link rel="alternate">` + `og:locale:alternate`; sitemap `xhtml:link` built from the same JSON in `astro.config.mjs` |
| Language switcher | `LanguageSwitcher.astro`: native `<details>`, shown only when the page has alternates; links carry `hreflang` and `lang`; Escape closes and returns focus |

Design choices worth knowing:

- **English at the root, not `/en/`.** This avoids redirecting live URLs. English is the `x-default`. Details are in
  the decisions file.
- **No page ships another language.** English strings are bundled into the island. A localized page passes only
  its own dictionary, trimmed to the settings its conversion uses (`uiStringsFor`). The audit checks this with a
  per-language sentinel string.
- **Engines stay language-neutral.** The UI maps error codes to localized text. Engine specifics such as
  "Invalid JSON at line 3, column 14" are shown underneath with `lang="en"`. Capability messages gained a stable
  `reason` code for the same purpose.
- **Unchanged for English pages:** same markup and strings. English tool pages gained hreflang tags and a language
  switcher only when localized versions exist; English-only pages have neither.

## SEO

- Unique title, meta description and H1 per page. The audit checks uniqueness site-wide; a unit test checks it
  per language.
- Self-referencing canonical. `<html lang>` matches the URL language. `og:locale` plus `og:locale:alternate`.
- hreflang on 47 pages: 30 localized tool pages, 12 English tool pages that have translations, and the home plus
  4 hubs. Every set is self-referencing and reciprocal, points only at existing canonical pages, and has one
  `x-default` pointing to English. English-only pages carry none.
- The sitemap lists all 120 indexable URLs with `xhtml:link` alternates. The audit verifies these match each
  page's tags exactly.
- JSON-LD on localized tool pages: BreadcrumbList (hub → page), WebApplication (localized name and description,
  `inLanguage`) and FAQPage for the visible FAQ. Hubs get a CollectionPage with an ItemList. No ratings or invented
  data.
- Internal links:
  - Localized pages link to related pages in the same language (reverse conversion first), to their hub, and to
    the English version.
  - Hubs link to every tool in their language.
  - Every footer lists the language hubs.
  - Policy pages are linked with `hreflang="en"` and a note that they are English-only.
- Nothing is noindexed except the existing 404 page.

## Ads (AdSense policy)

Localized tool pages use the same two `AdSlot` placements as English pages: after the converter and inside the
content, both outside the island and away from download buttons. The slot label is localized ("Iklan", "Reklam",
"Quảng cáo", "Publicidade"). Hubs have no ad slots. Every page has substantial original content around the tool;
the audit enforces at least 600 words of static HTML on each localized tool page.

## Validation results

| Check | Result |
| --- | --- |
| `npm run lint` | 0 problems |
| `prettier --check` | clean |
| `astro check` | 0 errors, 0 warnings, 0 hints (157 files) |
| Vitest | 165 tests passed (19 new in `tests/seo/localization.test.ts`) |
| `npm run build` | 121 pages |
| `scripts/audit-site.mjs` | all audits passed (new: localized pages, hreflang, sitemap hreflang, lang per URL) |
| Playwright (full suite) | 376 passed, 2 skipped by design (desktop + mobile) |

The new Playwright spec is `tests/e2e/localized.spec.ts`. It covers:

- every one of the 30 localized pages converting a real fixture, with the page-language UI, a valid output
  download, no console errors and no uploads
- a wrong file type error in Indonesian
- a malformed JSON error in Portuguese, with the English detail marked `lang="en"`
- a file-too-large error in Turkish
- paste mode in Vietnamese
- the language switcher by keyboard (Enter, links, `aria-current`, Escape returning focus)
- English pages offering localized versions only when they exist
- the hubs

axe (WCAG 2.1 AA) runs on four localized pages on desktop and mobile, plus the Turkish page in dark mode. The
layout test checks all 34 localized URLs on mobile for horizontal overflow and console errors.

Performance: English tool-page initial JS is 90.2 KB gzipped (budget 110 KB). Localized pages load exactly the
same scripts (audited). A localized page's serialized dictionary is about 8–10 KB of HTML attribute text
(roughly 2–3 KB gzipped). The homepage still ships no framework JavaScript.

## Remaining risks / manual follow-up

1. **No volume, CPC or difficulty data was available.** Google, Trends, autocomplete, Keyword Planner and Ahrefs
   were all blocked from this environment. Market selection rests on SERP composition from a US-located search
   index. Check the chosen keywords in Keyword Planner (Indonesia, Vietnam, Türkiye, Brazil) and in Search Console
   after 6–8 weeks.
2. **Native-speaker review.** All localized copy was written by hand for each market, not machine-translated, but
   it has not been reviewed by native speakers. Ask one per language to check tone and terminology, especially the
   Turkish and Vietnamese subtitle FAQs.
3. **Engine warnings and technical details stay in English** (marked `lang="en"`). Examples: "Metadata removed",
   JSON line/column errors. Localizing them would need structured engine messages.
4. **Policy pages are English-only.** Consider localized privacy summaries if AdSense reviewers or users in these
   markets ask for them.
5. **Portuguese is a TEST.** Keep it, expand it or remove it based on its impressions (see the decisions file).
6. **Romanian was inconclusive.** Re-check with a Romania-located SERP before deciding.
7. After deployment, submit the sitemap again and confirm that Search Console's International Targeting / hreflang
   report shows no errors.
