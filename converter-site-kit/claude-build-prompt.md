# Master Prompt for Claude Code

Build the production-ready project described in the files in this folder.

## Context

I am building a new organic-search website whose only monetization model is Google AdSense. My goals are:
- launch quickly;
- get initial organic impressions/clicks as early as realistically possible;
- have a technically excellent, fast website;
- spend nothing except the domain;
- deploy on Cloudflare Pages;
- differentiate strongly on UI/UX;
- make SEO a first-class part of the codebase;
- avoid a generic converter clone.

Read these files before coding:
1. `CLAUDE.md`
2. `research-and-business-decision.md`
3. `conversion-catalog.md`
4. `architecture.md`
5. `design.md`
6. `seo.md`
7. `adsense-and-policies.md`

Treat those files as product requirements, not optional suggestions.

## Phase 0 — repository setup

1. Initialize an Astro + React + TypeScript project.
2. Configure static output suitable for Cloudflare Pages.
3. Configure Tailwind CSS.
4. Add linting/formatting.
5. Add testing.
6. Create a clean typed data model for conversions.
7. Create the directory structure from `architecture.md`.

Do not start by making the homepage pretty. First establish the architecture.

## Phase 1 — data-driven SEO system

Create a strongly typed conversion model containing:
- slug;
- source format;
- target format;
- page title;
- meta description;
- short description;
- category;
- supported extensions;
- browser-processing status;
- primary keyword;
- secondary keywords;
- source format explanation;
- target format explanation;
- use cases;
- limitations;
- FAQ items;
- related conversions;
- engine identifier;
- phase/priority.

Generate the routes from this data.

Every route must be statically rendered with useful HTML content.

## Phase 2 — core design system

Implement the visual system in `design.md`.

Requirements:
- product-quality UI;
- distinctive, not template-like;
- no generic purple/blue gradient aesthetic;
- strong typography;
- responsive;
- keyboard accessible;
- polished upload states;
- subtle purposeful motion;
- excellent empty/loading/success/error states;
- ad areas visually separated from actions.

Build reusable primitives:
- Header
- Footer
- Breadcrumbs
- Search
- CategoryNav
- ToolCard
- ConverterShell
- Dropzone
- FileList
- FilePreview
- SettingsPanel
- ProgressBar
- ResultCard
- RelatedTools
- FAQ
- TrustStrip
- AdSlotPlaceholder

## Phase 3 — converter engine architecture

Create a common converter-engine abstraction.

UI components cannot import low-level conversion libraries directly.

Example:
```ts
interface ConverterEngine {
  id: string;
  canProcess(file: File): boolean;
  validate(input: unknown): ValidationResult;
  convert(input: ConversionInput, options?: ConversionOptions): Promise<ConversionResult>;
}
```

Create separate engine modules for:
- image;
- pdf;
- data;
- text;
- subtitles;
- document.

## Phase 4 — V1 converters

Implement the 60 core URLs from `conversion-catalog.md`.

Start with the easiest reliable conversions, then connect them to SEO routes.

### Images
HEIC → JPG/PNG/WebP
AVIF → JPG/PNG/WebP
WebP → JPG/PNG
JPG ↔ PNG
JPG/PNG → WebP
SVG → PNG/JPG
GIF/BMP/TIFF/ICO conversions listed in the catalog.

### PDF/image
JPG/PNG/WebP/HEIC → PDF
PDF → JPG/PNG/WebP

### Data
CSV ↔ JSON
CSV ↔ TSV
JSON ↔ TSV
CSV ↔ XML
XML ↔ CSV
JSON ↔ XML
JSON ↔ YAML
YAML ↔ JSON
YAML ↔ XML
CSV → XLSX

### Markup/text
Markdown ↔ HTML
HTML → Text
Markdown → Text
Base64 ↔ Text
JSON ↔ Base64
URL Encode/Decode

### Subtitles
SRT ↔ VTT
SRT ↔ ASS
SRT/VTT → TXT

### Documents
DOCX → HTML/TXT
PDF → Text

## Phase 5 — testing

For every engine:
- valid sample;
- empty input;
- malformed input;
- large-ish input;
- Unicode;
- multiple files where supported;
- filename sanitization;
- cancellation where supported.

Create golden fixtures for representative files.

Do not claim conversion fidelity beyond what the tests demonstrate.

## Phase 6 — SEO content

For each conversion page generate high-quality structured content based on the conversion metadata.

DO NOT create 60 identical articles with variable names.

Each page should have conversion-specific facts and limitations.

Example:
HEIC → JPG should explain why HEIC exists, compatibility issues, quality/file-size tradeoffs, and when JPG is the safer interoperability choice.

CSV → JSON should explain arrays/objects, headers, delimiter handling, nested-data limitations, and malformed-row behavior.

SRT → VTT should explain timestamp format differences and caption compatibility.

## Phase 7 — SEO technical layer

Implement:
- canonical URLs;
- sitemap;
- robots.txt;
- OpenGraph/Twitter metadata;
- JSON-LD where appropriate;
- breadcrumbs;
- semantic HTML;
- internal linking;
- category pages;
- related conversion modules;
- clean 404 page.

Make sure the key page content exists in the generated HTML before hydration.

## Phase 8 — AdSense readiness

Build but do NOT hard-code production ad IDs.

Create an `AdSlot` component with configuration placeholders.

Ads must never overlap converter actions or appear like download buttons.

Do not put ad components on empty/error/result-only screens.

Create all policy pages.

Create a privacy/consent architecture that can later integrate with Google Privacy & Messaging.

## Phase 9 — performance

Audit the dependency graph.

Heavy libraries must be dynamically imported only for pages that need them.

Do not ship PDF.js, HEIC decoder, or future FFmpeg assets to every page automatically.

The homepage should be extremely light.

## Phase 10 — quality audit

Before finishing:
1. Run build.
2. Run tests.
3. Run lint/typecheck.
4. Check all 60 URLs.
5. Confirm every tool has a working converter.
6. Confirm every page has unique title/meta/H1.
7. Confirm sitemap contains all intended pages.
8. Confirm no accidental duplicate routes.
9. Confirm mobile layout.
10. Confirm keyboard accessibility.
11. Confirm no file content reaches analytics.
12. Confirm no console warnings that matter.
13. Confirm Cloudflare Pages static deployment requirements.

## Final output

When the implementation is complete, produce:
- a finished codebase;
- `README.md` with local setup and deployment instructions;
- a list of implemented tools;
- a list of deferred tools and why;
- a list of known technical limitations;
- an SEO checklist;
- an AdSense pre-submission checklist.

Do not stop at a mockup. The output must be a working application.
