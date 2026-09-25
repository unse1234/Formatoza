// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import rehypeScrollable from './src/lib/markdown/rehype-scrollable.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SITE_URL = (env.PUBLIC_SITE_URL || 'https://formatoza.com').replace(/\/+$/, '');

// Pages that must never be listed in the sitemap (they are also `noindex`).
const SITEMAP_EXCLUDE = ['/404/'];

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
