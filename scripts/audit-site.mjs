// Post-build audit of dist/: SEO, routing, content-before-hydration, JS budgets
// and Cloudflare Pages limits. Exits non-zero on any failure.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const conversions = JSON.parse(readFileSync('src/data/conversions.json', 'utf8'));
const categories = JSON.parse(readFileSync('src/data/categories.json', 'utf8'));
const guides = readdirSync('src/content/guides').map((f) => f.replace(/\.md$/, ''));
const localizedPages = Object.entries(
  JSON.parse(readFileSync('src/data/localized-pages.json', 'utf8')),
).flatMap(([locale, entries]) =>
  entries.map((e) => ({ ...e, locale, path: `/${locale}/${e.slug}/` })),
);
const locales = [...new Set(localizedPages.map((p) => p.locale))];
const localeOf = (path) => locales.find((l) => path.startsWith(`/${l}/`)) ?? 'en';
const SITE = (process.env.PUBLIC_SITE_URL || 'https://formatoza.com').replace(/\/+$/, '');

const failures = [];
const warnings = [];
const fail = (m) => failures.push(m);
const ok = (m) => console.log(`  ✓ ${m}`);

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pathOf = (f) => {
  const r = '/' + relative(DIST, f).replace(/\\/g, '/');
  return r === '/404.html' ? '/404/' : r.replace(/index\.html$/, '');
};

const attr = (html, re) => (re.exec(html) || [])[1];
const decode = (s) =>
  s
    ?.replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
const pages = htmlFiles.map((f) => {
  const html = readFileSync(f, 'utf8');
  return {
    file: f,
    path: pathOf(f),
    html,
    title: decode(attr(html, /<title>([^<]*)<\/title>/)),
    description: decode(attr(html, /<meta name="description" content="([^"]*)"/)),
    canonical: attr(html, /<link rel="canonical" href="([^"]*)"/),
    robots: attr(html, /<meta name="robots" content="([^"]*)"/),
    h1s: [...html.matchAll(/<h1[\s>]/g)].length,
    h1: decode(
      attr(html, /<h1[^>]*>([\s\S]*?)<\/h1>/)
        ?.replace(/<[^>]+>/g, '')
        .trim(),
    ),
  };
});
const byPath = new Map(pages.map((p) => [p.path, p]));

console.log('\nRoutes');
const expected = [
  '/',
  '/guides/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/cookies/',
  '/how-it-works/',
  '/editorial-policy/',
  '/404/',
  ...conversions.map((c) => `/${c.slug}/`),
  ...Object.values(categories).map((c) => `/${c.path}/`),
  ...guides.map((g) => `/guides/${g}/`),
  ...locales.map((l) => `/${l}/`),
  ...localizedPages.map((p) => p.path),
];
for (const p of expected) if (!byPath.has(p)) fail(`missing page ${p}`);
for (const p of pages) if (!expected.includes(p.path)) fail(`unexpected page ${p.path}`);
ok(
  `${expected.length} expected pages present (${conversions.length} converters, ${localizedPages.length} localized tools in ${locales.length} languages), no unexpected routes`,
);

console.log('\nMetadata');
const indexable = pages.filter((p) => p.path !== '/404/');
for (const p of pages) {
  if (!p.title) fail(`${p.path}: missing <title>`);
  if (!p.description || p.description.length < 70 || p.description.length > 170)
    fail(`${p.path}: meta description length ${p.description?.length}`);
  if (p.h1s !== 1) fail(`${p.path}: ${p.h1s} <h1> elements`);
  if (
    !/property="og:title"/.test(p.html) ||
    !/property="og:image" content="https:\/\//.test(p.html) ||
    !/name="twitter:card"/.test(p.html)
  )
    fail(`${p.path}: incomplete Open Graph/Twitter tags`);
  if (!p.html.includes(`<html lang="${localeOf(p.path)}"`))
    fail(`${p.path}: <html lang> should be "${localeOf(p.path)}"`);
}
for (const p of indexable) {
  if (p.canonical !== `${SITE}${p.path}`) fail(`${p.path}: canonical ${p.canonical}`);
  if (!p.robots?.startsWith('index')) fail(`${p.path}: robots ${p.robots}`);
  if (p.title.length > 70) warnings.push(`${p.path}: title is ${p.title.length} chars`);
}
if (!byPath.get('/404/')?.robots?.startsWith('noindex')) fail('/404/ must be noindex');
for (const key of ['title', 'description', 'h1']) {
  const seen = new Map();
  for (const p of indexable) {
    const v = p[key]?.toLowerCase();
    if (seen.has(v)) fail(`duplicate ${key} on ${p.path} and ${seen.get(v)}: "${p[key]}"`);
    seen.set(v, p.path);
  }
}
ok('every page: title, meta description, canonical, robots, OG/Twitter, lang, exactly one H1');
ok('<html lang> matches the URL language on every page');
ok('titles, meta descriptions and H1s are unique across all indexable pages');

console.log('\nStructured data');
for (const p of pages) {
  for (const m of p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch (e) {
      fail(`${p.path}: invalid JSON-LD (${e.message})`);
      continue;
    }
    const types = (data['@graph'] ?? [data]).map((n) => n['@type']);
    p.ldTypes = types;
    if (/"(aggregateRating|review|reviews)"\s*:/.test(JSON.stringify(data)))
      fail(`${p.path}: JSON-LD must not contain ratings/reviews`);
  }
}
for (const c of conversions) {
  const t = byPath.get(`/${c.slug}/`)?.ldTypes ?? [];
  for (const need of ['BreadcrumbList', 'WebApplication', 'FAQPage', 'Organization'])
    if (!t.includes(need)) fail(`/${c.slug}/: JSON-LD lacks ${need}`);
}
for (const lp of localizedPages) {
  const t = byPath.get(lp.path)?.ldTypes ?? [];
  for (const need of ['BreadcrumbList', 'WebApplication', 'FAQPage'])
    if (!t.includes(need)) fail(`${lp.path}: JSON-LD lacks ${need}`);
}
for (const g of guides)
  if (!(byPath.get(`/guides/${g}/`)?.ldTypes ?? []).includes('Article'))
    fail(`/guides/${g}/: JSON-LD lacks Article`);
ok(
  'valid JSON-LD everywhere; tools have BreadcrumbList + WebApplication + FAQPage; guides have Article; no ratings',
);

console.log('\nContent present before hydration');
for (const c of conversions) {
  const p = byPath.get(`/${c.slug}/`);
  if (!p) continue;
  const text = p.html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 900) fail(`/${c.slug}/: only ${words} words of static HTML`);
  for (const needle of [
    `How to convert`,
    'Frequently asked questions',
    'Limitations and fidelity',
    'Supported files and limits',
    'Related converters',
  ])
    if (!p.html.includes(needle)) fail(`/${c.slug}/: static HTML lacks "${needle}"`);
  for (const rel of c.related)
    if (!p.html.includes(`href="/${rel}/"`)) fail(`/${c.slug}/: no link to related /${rel}/`);
  if (!p.html.includes('data-testid="dropzone"'))
    fail(`/${c.slug}/: converter UI not server-rendered`);
}
ok(
  'each tool page ships its H1, intro, steps, format facts, limits, FAQ, related links and converter markup in static HTML',
);

console.log('\nLocalized pages');
// Converter strings that must not appear in a localized page's static HTML (the island is
// server-rendered in the page language) and a sentinel per language to prove each page ships
// only its own dictionary.
const ENGLISH_UI = ['Choose files', 'Runs in your browser', 'Frequently asked questions', 'Drop '];
const SENTINEL = {
  id: 'Mengonversi…',
  vi: 'Đang chuyển đổi…',
  tr: 'Dönüştürülüyor…',
  pt: 'Convertendo…',
};
for (const lp of localizedPages) {
  const p = byPath.get(lp.path);
  if (!p) continue;
  const text = p.html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 600) fail(`${lp.path}: only ${words} words of static HTML`);
  for (const id of ['about', 'how-to', 'formats', 'limits', 'limitations', 'use-cases', 'faq'])
    if (!p.html.includes(`id="${id}"`)) fail(`${lp.path}: missing section #${id}`);
  if (!p.html.includes('data-testid="dropzone"')) fail(`${lp.path}: converter not server-rendered`);
  for (const en of ENGLISH_UI)
    if (text.includes(en)) fail(`${lp.path}: English UI text "${en}" in static HTML`);
  for (const [l, s] of Object.entries(SENTINEL))
    if ((l === lp.locale) !== p.html.includes(s))
      fail(`${lp.path}: ${l === lp.locale ? 'missing its' : 'ships the'} ${l} dictionary`);
  if (!p.html.includes(`href="/${lp.locale}/"`)) fail(`${lp.path}: no link to its hub`);
  if (!p.html.includes(`href="/${lp.conversion}/"`))
    fail(`${lp.path}: no link to the English page`);
  const words2 = lp.keyword.toLowerCase();
  if (!`${p.title} ${p.h1}`.toLowerCase().includes(words2))
    fail(`${lp.path}: researched keyword "${lp.keyword}" not in title or H1`);
}
for (const l of locales) {
  const hub = byPath.get(`/${l}/`);
  for (const lp of localizedPages.filter((x) => x.locale === l))
    if (!hub?.html.includes(`href="${lp.path}"`)) fail(`/${l}/: hub does not link ${lp.path}`);
}
ok(
  'localized tool pages: page-language UI in static HTML, own dictionary only, full content sections, researched keyword in title/H1, links to hub and English page',
);

console.log('\nhreflang');
const alternatesOf = (p) =>
  [...p.html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({
    lang: m[1],
    href: m[2],
  }));
let clusters = 0;
for (const p of indexable) {
  const alts = alternatesOf(p);
  if (!alts.length) continue;
  clusters++;
  const self = `${SITE}${p.path}`;
  if (!alts.some((a) => a.href === self && a.lang === localeOf(p.path)))
    fail(`${p.path}: hreflang set lacks a self-reference`);
  const xd = alts.filter((a) => a.lang === 'x-default');
  if (xd.length !== 1 || localeOf(xd[0].href.replace(SITE, '')) !== 'en')
    fail(`${p.path}: needs exactly one x-default pointing to English`);
  const langs = alts.map((a) => a.lang);
  if (new Set(langs).size !== langs.length) fail(`${p.path}: duplicate hreflang values`);
  for (const a of alts) {
    const target = byPath.get(a.href.replace(SITE, ''));
    if (!target) {
      fail(`${p.path}: hreflang ${a.lang} points to missing ${a.href}`);
      continue;
    }
    if (a.lang !== 'x-default' && localeOf(target.path) !== a.lang)
      fail(`${p.path}: hreflang ${a.lang} points to a ${localeOf(target.path)} page`);
    if (target.canonical !== a.href) fail(`${p.path}: hreflang target ${a.href} is not canonical`);
    const back = alternatesOf(target);
    const key = (xs) =>
      xs
        .map((x) => `${x.lang} ${x.href}`)
        .sort()
        .join('|');
    if (key(back) !== key(alts)) fail(`${p.path}: hreflang not reciprocal with ${a.href}`);
  }
}
for (const c of conversions) {
  const has = localizedPages.some((x) => x.conversion === c.slug);
  const p = byPath.get(`/${c.slug}/`);
  if (p && !has && alternatesOf(p).length) fail(`/${c.slug}/: hreflang on an English-only page`);
}
ok(
  `${clusters} pages carry hreflang: self-referencing, reciprocal, existing targets, one English x-default; English-only pages carry none`,
);

console.log('\nInternal links');
const known = new Set([
  ...pages.map((p) => p.path),
  '/sitemap-index.xml',
  '/robots.txt',
  '/search-index.json',
  '/ads.txt',
]);
let links = 0;
for (const p of pages)
  for (const m of p.html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (
      /\.(png|svg|ico|webmanifest|woff2|css|js|xml|json|txt)$/.test(href) ||
      href.startsWith('/_astro/') ||
      href.startsWith('/vendor/')
    ) {
      if (!existsSync(join(DIST, href))) fail(`${p.path}: broken asset link ${href}`);
      continue;
    }
    links++;
    if (!known.has(href)) fail(`${p.path}: broken link ${href}`);
    if (!href.endsWith('/')) fail(`${p.path}: link without trailing slash ${href}`);
  }
ok(`${links} internal page links resolve, all canonical (trailing slash)`);

console.log('\nSitemap & robots');
const index = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8');
const sitemapFiles = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, ''));
const urls = sitemapFiles.flatMap((f) =>
  [...readFileSync(join(DIST, f), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]),
);
const want = new Set(indexable.map((p) => `${SITE}${p.path}`));
for (const u of urls) if (!want.has(u)) fail(`sitemap contains unexpected URL ${u}`);
for (const u of want) if (!urls.includes(u)) fail(`sitemap misses ${u}`);
if (new Set(urls).size !== urls.length) fail('sitemap has duplicates');
ok(`sitemap lists exactly the ${want.size} canonical indexable pages (404 excluded)`);
const sitemapXml = sitemapFiles.map((f) => readFileSync(join(DIST, f), 'utf8')).join('');
for (const m of sitemapXml.matchAll(/<url><loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)) {
  const links = [...m[2].matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)]
    .map((x) => `${x[1]} ${x[2]}`)
    .sort()
    .join('|');
  const page = byPath.get(m[1].replace(SITE, ''));
  const tags = page
    ? alternatesOf(page)
        .map((a) => `${a.lang} ${a.href}`)
        .sort()
        .join('|')
    : '';
  if (links !== tags) fail(`sitemap hreflang for ${m[1]} differs from the page's tags`);
}
ok('sitemap hreflang annotations match each page’s <link rel="alternate"> tags');
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
if (
  !/User-agent: \*\nAllow: \//.test(robots) ||
  !robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`) ||
  /Disallow: \/(_astro|vendor)/.test(robots)
)
  fail('robots.txt is wrong');
ok('robots.txt allows crawling (including JS/CSS) and points to the sitemap');

console.log('\nPerformance budgets');
const gz = (f) => gzipSync(readFileSync(f)).length;
const scriptSrcs = (html) =>
  [
    ...html.matchAll(/<script[^>]+src="(\/_astro\/[^"]+)"/g),
    ...html.matchAll(/(?:component|renderer)-url="(\/_astro\/[^"]+)"/g),
  ].map((m) => m[1]);
const home = byPath.get('/');
const homeJs = scriptSrcs(home.html);
if (homeJs.length) fail(`homepage loads framework JS: ${homeJs.join(', ')}`);
const homeInline = [
  ...home.html.matchAll(/<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g),
].reduce((n, m) => n + m[1].length, 0);
ok(
  `homepage: no external JS, ${(homeInline / 1024).toFixed(1)} KB inline script, HTML ${(gz(home.file) / 1024).toFixed(1)} KB gzipped`,
);
const css = files.filter((f) => /_astro\/.*\.css$/.test(f));
const cssGz = css.reduce((n, f) => n + gz(f), 0);
if (cssGz > 20_000) fail(`CSS is ${cssGz} bytes gzipped`);
ok(`CSS ${(cssGz / 1024).toFixed(1)} KB gzipped`);

// Initial JS for a tool page = island + renderer + their static imports.
function staticGraph(entry, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const src = readFileSync(join(DIST, entry), 'utf8');
  for (const m of src.matchAll(
    /(?:^|[;\s])import\s*(?:[^'"()]*?from\s*)?["'](\.\/[^"']+\.js)["']/g,
  ))
    staticGraph(`/_astro/${m[1].slice(2)}`, seen);
  return seen;
}
const tool = byPath.get('/heic-to-jpg/');
const graph = new Set();
for (const s of scriptSrcs(tool.html)) staticGraph(s, graph);
const localizedTool = localizedPages[0] && byPath.get(localizedPages[0].path);
if (
  localizedTool &&
  scriptSrcs(localizedTool.html).sort().join() !== scriptSrcs(tool.html).sort().join()
)
  fail(`${localizedTool.path}: loads different scripts than the English tool page`);
const toolJs = [...graph].reduce((n, f) => n + gz(join(DIST, f)), 0);
const heavy = [...graph].filter((f) =>
  /\/(pdf|heic|mammoth|papaparse|yaml|xml|UTIF|webp_enc|marked|turndown|fflate|core|render|es)[.-]/i.test(
    f,
  ),
);
if (heavy.length) fail(`tool page statically loads heavy chunks: ${heavy.join(', ')}`);
if (toolJs > 110_000) fail(`tool page initial JS ${toolJs} bytes gzipped`);
ok(
  `tool page initial JS ${(toolJs / 1024).toFixed(1)} KB gzipped (React + island); no conversion library in the initial graph`,
);

console.log('\nCloudflare Pages limits');
const big = files.filter((f) => statSync(f).size > 25 * 1024 * 1024);
if (big.length) fail(`assets over 25 MiB: ${big.join(', ')}`);
if (files.length > 20_000) fail(`${files.length} files exceeds 20,000`);
const largest = files.reduce((a, f) => (statSync(f).size > statSync(a).size ? f : a));
ok(
  `${files.length} files (limit 20,000); largest ${relative(DIST, largest)} ${(statSync(largest).size / 1024 / 1024).toFixed(2)} MiB (limit 25 MiB)`,
);
for (const f of [
  '_headers',
  'robots.txt',
  'sitemap-index.xml',
  '404.html',
  'ads.txt',
  'favicon.ico',
  'og/default.png',
])
  if (!existsSync(join(DIST, f))) fail(`dist/${f} missing`);
ok('_headers, 404.html, robots.txt, sitemap, ads.txt and icons are in the output');

console.log('\nPrivacy');
const external = new Set();
for (const p of pages)
  for (const m of p.html.matchAll(
    /<(?:script|link|img|iframe)[^>]+(?:src|href)="(https?:\/\/[^"]+)"/g,
  ))
    if (!m[1].startsWith(SITE)) external.add(m[1]);
if (external.size && !process.env.PUBLIC_ADSENSE_CLIENT && !process.env.PUBLIC_CF_BEACON_TOKEN)
  fail(`third-party resources without ads/analytics configured: ${[...external].join(', ')}`);
ok(`third-party resources loaded by pages: ${external.size ? [...external].join(', ') : 'none'}`);

for (const w of warnings) console.log(`  ! ${w}`);
if (failures.length) {
  console.error(`\n✗ ${failures.length} problem(s):`);
  for (const f of failures.slice(0, 100)) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nAll audits passed.');
