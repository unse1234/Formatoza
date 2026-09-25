# SEO Specification

## Primary objective
Build a site where Google can understand every conversion as a standalone useful page, while preventing the project from becoming a mass-produced set of thin pages.

## Site architecture

```text
/
├── /image-converters
├── /pdf-converters
├── /data-converters
├── /developer-converters
├── /subtitle-converters
├── /document-converters
├── /guides
└── /<exact-conversion-slug>
```

Use short exact-intent URLs such as `/heic-to-jpg`, not `/tools/image/heic-jpg-conversion-online-free`.

## Tool-page template

Every indexed page should contain:
1. Breadcrumb.
2. One clear H1: `[Source] to [Target] Converter`.
3. One-sentence value proposition.
4. Working converter above the fold.
5. Supported files and limits.
6. Privacy/processing statement.
7. "How to convert X to Y" steps.
8. "About X and Y" section.
9. Conversion limitations and fidelity notes.
10. Example/use cases.
11. Related conversions.
12. FAQ.
13. Author/site trust block.
14. Footer policy/contact links.

Do not use the exact same body paragraph with only format names swapped. The page data model should supply format-specific facts and examples.

## Title formulas

Primary:
`[Source] to [Target] Converter — Free Online | Brand`

Alternative:
`Convert [Source] to [Target] Online — Free & Private | Brand`

Keep titles natural and avoid keyword stuffing.

## Meta description formula

`Convert [source] files to [target] online in your browser. No signup. See supported formats, limits and conversion steps. Free to use.`

Rewrite when it becomes repetitive.

## Keyword targeting

Each tool has:
- 1 primary keyword.
- 3–8 closely related variants.
- 2–5 semantic terms.
- 3–8 internal links to related conversions.

Do not create separate pages for trivial grammatical variants when the same SERP intent is served. A single page can target multiple variants that overlap strongly.

## First keyword priorities

### High-demand image/PDF
- heic to jpg
- webp to jpg
- webp to png
- avif to jpg
- avif to png
- jpg to pdf
- pdf to png
- pdf to jpg

### Data/developer
- csv to json
- json to csv
- xml to json
- json to xml
- json to yaml
- yaml to json
- markdown to html
- html to markdown

### Smaller intent pages
- srt to vtt
- vtt to srt
- srt to ass
- docx to html
- docx to txt

## Internal linking rules

Every tool page links to:
- Parent category.
- Reverse conversion if available.
- 4–8 related source/target conversions.
- One relevant educational guide.

Categories link back to the highest-priority tools and explain the use cases of the category.

## Canonicalization

Each conversion page has one canonical URL.

Avoid duplicate URLs for:
- `/heic-to-jpg/`
- `/tools/heic-to-jpg`
- `/convert/heic-to-jpg`

Pick one canonical path.

## Sitemap strategy

Include only canonical, indexable pages that have real publisher content and a useful functioning tool.

Do not put:
- tool state URLs,
- error pages,
- upload result URLs,
- temporary conversion IDs,
- search/filter URLs,
- duplicate pages
in the sitemap.

## Robots.txt

Allow normal public pages and assets. Do not block the converter JS/CSS required for rendering the page.

## Structured data

Use valid structured data based on the visible page:
- Organization for site identity where appropriate.
- BreadcrumbList for tool/category pages.
- SoftwareApplication/WebApplication only if the page actually represents a web application and all properties are accurate.

Do not invent ratings/reviews, prices or software properties.

## Content quality

Google's scaled content abuse policy is a major project risk. Content should be produced from a structured knowledge base but reviewed and enriched so each page actually helps the user.

The codebase should support:
- unique conversion facts,
- supported formats,
- input/output caveats,
- examples,
- related searches,
- FAQ blocks,
- tested examples.

## Technical performance

Targets:
- Fast initial HTML response.
- No blocking conversion engine on first paint.
- Lazy-load heavy decoder libraries.
- Use dynamic import per conversion family.
- Do not ship FFmpeg to every user.
- Optimize fonts and images.
- Prefer SVG icons.
- Avoid huge client-side dependency bundles.

## Search Console loop

Every week:
1. Export top queries.
2. Find pages with impressions but weak CTR.
3. Improve title/meta/intent match.
4. Find pages ranking 8–30.
5. Improve their supporting content and internal links.
6. Find new query variants.
7. Add a new page only when the intent is materially distinct.
