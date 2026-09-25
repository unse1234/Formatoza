// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { readFileSync } from 'node:fs';
import rehypeScrollable from './src/lib/markdown/rehype-scrollable.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SITE_URL = (env.PUBLIC_SITE_URL || 'https://formatoza.com').replace(/\/+$/, '');

// Pages that must never be listed in the sitemap (they are also `noindex`).
const SITEMAP_EXCLUDE = ['/404/'];

/**
 * hreflang groups for the sitemap, from the same data the pages use
 * (src/data/localized-pages.json). Each group lists English plus every localized
 * version that exists; the audit checks these against the <link rel="alternate"> tags.
 */
function hreflangGroups() {
  const pages = JSON.parse(readFileSync('./src/data/localized-pages.json', 'utf8'));
  /** @type {Map<string, { lang: string; path: string }[]>} */
  const byConversion = new Map();
  /** @type {string[]} */
  const locales = [];
  /** @type {Record<string, { conversion: string; slug: string }[]>} */
  const data = pages;
  for (const [locale, entries] of Object.entries(data)) {
    if (entries.length) locales.push(locale);
    for (const e of entries) {
      const group = byConversion.get(e.conversion) ?? [{ lang: 'en', path: `/${e.conversion}/` }];
      group.push({ lang: locale, path: `/${locale}/${e.slug}/` });
      byConversion.set(e.conversion, group);
    }
  }
  const groups = [...byConversion.values()];
  if (locales.length)
    groups.push([{ lang: 'en', path: '/' }, ...locales.map((l) => ({ lang: l, path: `/${l}/` }))]);
  /** @type {Map<string, { lang: string; url: string }[]>} */
  const byPath = new Map();
  for (const g of groups) {
    const english = g.find((x) => x.lang === 'en')?.path ?? '/';
    const links = [
      ...g.map((x) => ({ lang: x.lang, url: `${SITE_URL}${x.path}` })),
      { lang: 'x-default', url: `${SITE_URL}${english}` },
    ];
    for (const x of g) byPath.set(x.path, links);
  }
  return byPath;
}
const HREFLANG = hreflangGroups();

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  // Cloudflare Pages serves `/heic-to-jpg/index.html` at `/heic-to-jpg/` and
  // 308-redirects `/heic-to-jpg` to it, so the slash form is the canonical one.
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  // Code samples in content are short; plain, theme-aware styling beats a second color scheme.
  markdown: { syntaxHighlight: false, rehypePlugins: [rehypeScrollable] },
  prefetch: false,
  integrations: [
    react(),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDE.some((path) => new URL(page).pathname === path),
      serialize(item) {
        const links = HREFLANG.get(new URL(item.url).pathname);
        return links ? { ...item, links } : item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      // HEIC decoder (~3 MB) and PDF.js are lazy chunks loaded only on demand.
      chunkSizeWarningLimit: 3500,
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      exclude: ['@jsquash/webp'],
    },
  },
});
