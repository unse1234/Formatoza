# CLAUDE.md — Converter Site Build Instructions

You are building a production-quality, SEO-first, AdSense-monetized, browser-first file conversion website.

## Non-negotiable business constraints

- Only paid item is the domain.
- Deployment target: Cloudflare Pages.
- No database.
- No custom backend.
- No paid APIs.
- No external file-upload processing in V1.
- Use browser-side processing wherever technically reliable.
- The website must be usable before any ad script is installed.
- Do not sacrifice conversion UX for ad inventory.

## Primary SEO constraint
Do not mass-produce shallow conversion pages.

Every indexed page must have useful static HTML content plus a genuinely working tool.
The conversion-specific content must not be a generic paragraph with format names swapped.

## Recommended implementation

- Astro static generation.
- React interactive islands.
- TypeScript.
- Tailwind CSS.
- Dynamic imports for heavy conversion engines.
- Static generation for all public tool pages.

## Coding principles

1. Build a reusable converter engine interface.
2. Keep conversion logic separate from UI.
3. Keep SEO metadata/data separate from converter logic.
4. Use a structured `conversions.json` source of truth.
5. Generate routes from conversion metadata.
6. Generate breadcrumbs, related-tool links and sitemap entries from the same metadata.
7. Every tool has automated tests with fixtures.
8. Do not add a dependency without checking browser support, license and bundle impact.
9. Prefer native browser APIs when they are reliable.
10. Lazy-load large decoders/renderers.

## V1 conversion engines

Implement first:
- image format conversion;
- HEIC decoding where needed;
- PDF ↔ image;
- CSV/TSV/JSON/XML/YAML conversions;
- Markdown/HTML/text conversions;
- Base64/URL/text encodings;
- subtitle conversions;
- DOCX → HTML/TXT;
- PDF text extraction.

Defer:
- PDF → Word;
- Word → PDF with layout fidelity claims;
- PDF → Excel;
- PPTX → PDF;
- large video/audio conversion.

## UX

The converter is the main product.

Use a visually distinctive, calm interface. Avoid generic purple/blue AI SaaS gradients.

Required states:
- idle;
- drag over;
- file selected;
- validating;
- converting;
- success;
- partial failure;
- unsupported format;
- oversized file;
- browser capability limitation.

## SEO implementation requirements

For every tool page output:
- unique title;
- unique meta description;
- canonical URL;
- robots directives;
- Open Graph metadata;
- breadcrumb data;
- relevant JSON-LD;
- exactly one useful H1;
- descriptive headings;
- crawlable related links;
- static visible explanatory text;
- accessible converter controls.

Generate sitemap and robots.txt automatically.

## Schema

Use schema only where it matches visible content. Consider Organization, BreadcrumbList and SoftwareApplication/WebApplication when appropriate.
Do not invent ratings/reviews.

## Performance

Target excellent Core Web Vitals.
- No large converter WASM in the initial page load if avoidable.
- Code split by conversion family.
- Lazy load HEIC/PDF/office engines.
- Optimize fonts.
- Minimize third-party scripts.
- Load ad scripts only when configured and consent requirements are met.

## AdSense readiness

Create the following pages before approval:
- About
- Contact
- Privacy
- Terms
- How It Works
- Editorial/Quality Policy

Do not put ads on:
- empty screens;
- error-only pages;
- the upload/download controls;
- pages with almost no publisher content.

## Content quality

For each launch page write conversion-specific content covering:
- what the source format is;
- what the target format is;
- why people convert it;
- typical use cases;
- compatibility notes;
- quality/fidelity tradeoffs;
- how the tool works;
- limitations.

## File handling safety

- Uploaded files are untrusted.
- Never execute file content.
- Sanitize HTML generated from documents.
- Do not use unsanitized `innerHTML` for user-generated content.
- Revoke object URLs.
- Do not log file contents.
- Avoid exposing source file names to analytics.

## Definition of done

The first release is done only when:
1. 60 core conversion pages build successfully.
2. Each page has unique static SEO content.
3. Core converters pass unit tests.
4. Mobile UX works.
5. Keyboard navigation works.
6. Sitemap includes only intended canonical pages.
7. Robots.txt is correct.
8. No console errors on core flows.
9. A clean production build succeeds on Cloudflare Pages.
10. AdSense placeholders are policy-safe and can be enabled later without redesigning the page.
