# CLAUDE.md — Formatoza codebase guide

Product requirements live in `converter-site-kit/` (business decision, catalog, architecture, design,
SEO and AdSense policy). Read them before changing product behaviour. This file covers how the code is
organised and the rules that keep it healthy.

## Commands

```bash
npm run dev          # local dev server (copies PDF.js data first)
npm run build        # static build into dist/
npm run verify       # lint + format + astro check + unit tests + build + site audit
npm run e2e          # build + Playwright (all 63 converters, a11y, layout, privacy)
npm run fixtures     # regenerate test fixtures in tests/fixtures/input
```

## Architecture rules (enforced by lint and tests)

1. **UI never imports conversion libraries.** Components get engines only via `loadEngine()` in
   `src/engines/registry.ts`. ESLint's `no-restricted-imports` blocks pdfjs, pdf-lib, heic-to, mammoth,
   papaparse, etc. in `src/components`, `src/pages` and `src/layouts`.
2. **Every engine implements `ConverterEngine`** (`src/engines/types.ts`) and is lazy-loaded. Heavy
   libraries are imported dynamically *inside* the engine, only on the code path that needs them.
3. **Data is the source of truth.** Add a conversion by editing `src/data/conversions.json` and adding
   `src/content/conversions/<slug>.md`. Routes, sitemap, breadcrumbs, related links and JSON-LD are
   generated. `registry.ts` validates the JSON at build time; `tests/seo/catalog.test.ts` enforces
   uniqueness and content quality.
4. **Settings are declarative** (`src/engines/options.ts`) so the UI and the static "How to" steps can
   describe them without loading an engine. Engines must call `resolveOptions()` on untrusted input.
5. **Claims must match behaviour.** Content may only state what the engine does and tests demonstrate.
   When you change engine behaviour, update the affected Markdown and golden fixtures.
6. **Untrusted input.** Never inject converted HTML without `sanitizeHtml()`; render previews in a
   sandboxed iframe; sanitise output file names with `outputFileName()`; never log file contents.
7. **Analytics** go through `track()` in `src/lib/analytics`, which only forwards whitelisted enums.
8. **Ads** only via `<AdSlot>` outside the converter island, only on tool and guide pages, and only
   when `PUBLIC_ADSENSE_CLIENT` is configured. Never near download buttons.

## Design

Implements `converter-site-kit/DESIGN.md`: tokens in `src/styles/global.css` (achromatic palette,
shadow-as-border, Geist 400/500/600, double-ring focus, status colours only as dots). Link text uses
`#005FCC` (not `#0072F5`) to meet WCAG AA; `#0072F5` is the focus ring colour.

## Testing

- Unit (Vitest): `tests/conversion/*` per engine (valid, empty, malformed, large, Unicode, multi-file,
  file-name sanitisation, cancellation) with golden outputs in `tests/fixtures/golden/`.
- SEO/content (Vitest): `tests/seo/*`.
- Browser (Playwright): `tests/e2e/*` — every converter end to end, flows/states, axe, keyboard,
  mobile overflow, console errors, and a no-upload network check.
- Post-build audit: `scripts/audit-site.mjs`.
