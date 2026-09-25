# Converter Site — Start Here

## Business goal
Build a free, privacy-first online file conversion website monetized with Google AdSense, with a realistic target of getting initial organic traffic and first ad revenue within roughly two months. This is a target, not a guarantee.

## Recommended positioning
A fast, browser-first conversion workspace where supported files are processed locally on the user's device.

Core promise:
- No account required.
- No unnecessary uploads.
- Fast browser-side processing for supported conversions.
- Clear conversion-specific guidance and limitations.
- Every important conversion has its own crawlable URL.

## Recommended product name
Primary candidate: **FormatMeld** (`formatmeld.com`) — brandable, broad enough for documents, images, data and developer conversions.

Other candidate names from the research pass:
- `Formatoza.com`
- `ConvertBrix.com`
- `ConvertCove.com`
- `FileMeld.com`
- `FormatBrix.com`

Important: the research environment could not perform an authenticated real-time registrar checkout/availability transaction. These candidates had no exact public-registration/brand result in the searches performed, but availability must be checked immediately before purchase. A registrar's live availability result is authoritative. Current Namecheap standard .com registration is $11.28; the renewal price shown is $18.48. Cloudflare Registrar sells supported domains at registry/ICANN cost with no markup. The initial $12 domain budget is therefore realistic for an available standard .com, but renewal pricing should be budgeted separately.

## Recommended stack
- Astro static site generation for crawlable HTML and fast static deployment.
- React components/islands only where interactive UI is needed.
- TypeScript for conversion-engine contracts and data safety.
- Tailwind CSS or equivalent utility styling.
- Client-side conversion libraries only for v1.
- Cloudflare Pages for deployment.
- Google Search Console for SEO monitoring.
- Google AdSense for monetization.
- No database.
- No custom backend.
- No paid API.
- No paid analytics.

## V1 launch strategy
Do NOT launch 300+ thin pages.
Launch roughly 50–70 strong conversion pages across:
1. Image conversions
2. PDF/image conversions
3. Data/developer conversions
4. Subtitle conversions
5. Text/markup conversions
6. A small document-conversion cluster that is technically reliable in-browser

Each indexed tool page must contain the real tool plus useful, conversion-specific explanatory content. Google explicitly warns against scaled content that exists mainly to manipulate rankings, and Google-served ads are not allowed on screens with no/low-value publisher content.

## Do not build in V1
- PDF → Word with promises of perfect layout preservation.
- PDF → Excel with layout-perfect claims.
- Full Office → PDF conversion if it depends on server-side LibreOffice.
- Heavy video/audio conversions using a large server-side processing pipeline.
- Anything that requires paid API calls.
- Hundreds of near-identical pages generated without meaningful conversion-specific differences.

## First-month success definition
The first two months are about validating:
- Google indexing of tool pages.
- Impressions and first organic clicks.
- A few pages entering useful search positions.
- AdSense approval and compliant ad serving once eligible.
- Conversion completion rate and page engagement.

Do not promise a revenue figure before Search Console data exists.
