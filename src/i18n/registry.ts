/**
 * Localized page registry: which conversions exist in which language, their URLs and
 * their hreflang alternates. Pure data (no Astro APIs), validated at import time like the
 * catalog, so a bad entry fails the build and the tests.
 */
import pagesJson from '~/data/localized-pages.json';
import { getConversionMeta } from '~/lib/catalog/registry';
import type { ConversionMeta } from '~/lib/catalog/types';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALIZED_LOCALES,
  isLocalizedLocale,
  localeHomePath,
  type LocaleCode,
  type LocalizedLocaleCode,
} from './locales';

export interface LocalizedPageRef {
  locale: LocalizedLocaleCode;
  /** English catalog slug of the conversion this page exposes. */
  conversion: string;
  /** Localized URL slug (from keyword research). */
  slug: string;
  /** Primary researched keyword; must appear in the page title or H1. */
  keyword: string;
  path: string;
  /** Content collection id: `{locale}/{slug}`. */
  contentId: string;
  meta: ConversionMeta;
}

export interface Alternate {
  hreflang: string;
  href: string;
  locale: LocaleCode | 'x-default';
}

class LocalizationError extends Error {
  constructor(message: string) {
    super(`[i18n] ${message}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new LocalizationError(message);
}

export const LOCALIZED_PAGES: LocalizedPageRef[] = (() => {
  const raw = pagesJson as Record<string, { conversion: string; slug: string; keyword: string }[]>;
  const out: LocalizedPageRef[] = [];
  for (const [locale, entries] of Object.entries(raw)) {
    assert(isLocalizedLocale(locale), `unknown locale "${locale}" in localized-pages.json`);
    const slugs = new Set<string>();
    const conversions = new Set<string>();
    for (const e of entries) {
      assert(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug), `${locale}: bad slug "${e.slug}"`);
      assert(!slugs.has(e.slug), `${locale}: duplicate slug "${e.slug}"`);
      assert(!conversions.has(e.conversion), `${locale}: duplicate conversion "${e.conversion}"`);
      assert(e.keyword.trim().length >= 5, `${locale}/${e.slug}: keyword missing`);
      slugs.add(e.slug);
      conversions.add(e.conversion);
      // Throws for unknown conversions: localized pages may only expose tools that exist.
      const meta = getConversionMeta(e.conversion);
      out.push({
        locale,
        conversion: e.conversion,
        slug: e.slug,
        keyword: e.keyword,
        path: `/${locale}/${e.slug}/`,
        contentId: `${locale}/${e.slug}`,
        meta,
      });
    }
  }
  return out;
})();

export function localizedPagesFor(locale: LocalizedLocaleCode): LocalizedPageRef[] {
  return LOCALIZED_PAGES.filter((p) => p.locale === locale);
}

export function localizedPageFor(
  locale: LocalizedLocaleCode,
  conversion: string,
): LocalizedPageRef | undefined {
  return LOCALIZED_PAGES.find((p) => p.locale === locale && p.conversion === conversion);
}

/** Locales that have at least one page (only these get a hub and hreflang). */
export const ACTIVE_LOCALES: LocalizedLocaleCode[] = LOCALIZED_LOCALES.filter((l) =>
  LOCALIZED_PAGES.some((p) => p.locale === l),
);

function withDefault(list: Alternate[], englishHref: string): Alternate[] {
  return [...list, { hreflang: 'x-default', href: englishHref, locale: 'x-default' }];
}

/**
 * hreflang set for a conversion: English + every localized version that exists, plus
 * x-default (English). Empty when the conversion is English-only, so English-only
 * pages carry no hreflang at all.
 */
export function conversionAlternates(conversion: string): Alternate[] {
  const localized = LOCALIZED_PAGES.filter((p) => p.conversion === conversion);
  if (!localized.length) return [];
  const english = getConversionMeta(conversion).path;
  return withDefault(
    [
      { hreflang: LOCALES[DEFAULT_LOCALE].hreflang, href: english, locale: DEFAULT_LOCALE },
      ...ACTIVE_LOCALES.flatMap((l) => {
        const p = localized.find((x) => x.locale === l);
        return p ? [{ hreflang: LOCALES[l].hreflang, href: p.path, locale: l }] : [];
      }),
    ],
    english,
  );
}

/** hreflang set for the home page and the localized hubs. */
export function homeAlternates(): Alternate[] {
  return withDefault(
    [
      { hreflang: LOCALES[DEFAULT_LOCALE].hreflang, href: '/', locale: DEFAULT_LOCALE },
      ...ACTIVE_LOCALES.map((l) => ({
        hreflang: LOCALES[l].hreflang,
        href: localeHomePath(l),
        locale: l,
      })),
    ],
    '/',
  );
}
