# Architecture Specification

## Goal
Static SEO-first conversion application with browser-side processing and zero application backend.

## Stack
- Astro static site generation.
- React islands for interactive converter UI.
- TypeScript.
- Tailwind CSS.
- Cloudflare Pages.
- No database.
- No server-side file processing in V1.

## Directory layout

```text
/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── site.webmanifest
│   └── og/
├── src/
│   ├── components/
│   │   ├── converter/
│   │   ├── layout/
│   │   ├── ads/
│   │   ├── seo/
│   │   └── ui/
│   ├── content/
│   │   ├── conversions/
│   │   ├── guides/
│   │   └── faq/
│   ├── data/
│   │   ├── conversions.json
│   │   ├── categories.json
│   │   ├── keyword-targets.json
│   │   └── supported-formats.json
│   ├── engines/
│   │   ├── image/
│   │   ├── pdf/
│   │   ├── data/
│   │   ├── text/
│   │   └── subtitles/
│   ├── lib/
│   │   ├── seo/
│   │   ├── file/
│   │   ├── analytics/
│   │   └── security/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── [slug].astro
│   │   ├── categories/[category].astro
│   │   ├── guides/[slug].astro
│   │   ├── about.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── contact.astro
│   │   ├── editorial-policy.astro
│   │   └── how-it-works.astro
│   └── styles/
│       └── global.css
├── tests/
│   ├── conversion/
│   ├── seo/
│   └── fixtures/
├── CLAUDE.md
├── design.md
├── seo.md
├── adsense-and-policies.md
└── README.md
```

## Conversion engine contract

Every converter should expose a common interface:

```ts
export interface ConverterEngine {
  id: string;
  sourceFormats: string[];
  targetFormats: string[];
  canProcess(file: File): boolean;
  validate(input: ConversionInput): ValidationResult;
  convert(input: ConversionInput, options?: ConversionOptions): Promise<ConversionResult>;
  supportsBatch: boolean;
  runsLocally: boolean;
}
```

The UI must never know implementation details of PDF.js, Mammoth, a HEIC decoder, Papa Parse, etc. It calls the engine interface.

## Client-side privacy

For local converters:
- Never upload source files.
- Never send file names to analytics.
- Never include file content in logs.
- Revoke object URLs when finished.
- Release large ArrayBuffers when possible.
- Show a visible "Processed in your browser" badge only on tools that truly behave that way.

Do not claim "100% private" on a tool if it calls any external service.

## Large-file safeguards

- Show file size before processing.
- Warn users when a file is likely to exceed browser memory limits.
- Set sane defaults.
- Never freeze the main UI during long conversions; use Workers where useful.
- Provide progress for multi-file operations.
- Allow canceling jobs where practical.
- Prevent accidental repeated work when a conversion is already running.

## SEO rendering

Every conversion landing page must contain meaningful HTML in the initial static build output. The interactive converter should hydrate on the client, but the primary heading, introduction, supported formats, process explanation, related conversions and FAQ must exist in the generated HTML.

Create each page from a structured data object so titles, descriptions, breadcrumbs, canonical URLs, schema, copy blocks and related links are consistent.

## Schema

Use Organization/Site navigation markup where appropriate, BreadcrumbList on tool/category pages, and only use SoftwareApplication/WebApplication structured data when the page actually represents a web app and the markup accurately describes it. Structured data must match visible content.

## Deployment

Cloudflare Pages:
- Build command: `npm run build`
- Output directory: `dist`
- No runtime functions for V1.
- Static assets only.

Cloudflare Pages currently allows up to 20,000 files on the Free plan and 25 MiB per individual asset. Static asset requests are free/unlimited on the current Pages model.

## Package/licensing discipline

Before adding a dependency:
1. Verify it supports browser builds.
2. Verify license compatibility.
3. Check bundle size.
4. Check maintenance/current release status.
5. Avoid a package if native browser APIs can do the job cleanly.

Known useful building blocks:
- PDF.js for parsing/rendering PDF documents in the browser.
- pdf-lib for creating/manipulating PDF files.
- Mammoth for DOCX → HTML/text in the browser.
- Papa Parse for CSV.
- js-yaml for YAML.
- fast-xml-parser for XML.
- marked + turndown for Markdown/HTML transformations.
- JSZip for ZIP operations.
- HEIC decoder such as heic2any for HEIC where required.

Do not add FFmpeg WebAssembly to the initial bundle; lazy-load it only in a later video/audio phase and evaluate asset-size/license/runtime impact first.
