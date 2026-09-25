/**
 * Astro-only: joins the localized page registry with its Markdown content and checks that
 * both sides match (every listed page has content, and no content exists without a listing).
 */
import { getCollection, getEntry, render } from 'astro:content';
import type { LocalizedConversionFrontmatter } from '~/lib/catalog/content-schema';
import { LOCALIZED_PAGES, localizedPageFor, type LocalizedPageRef } from './registry';

export type LocalizedPage = LocalizedPageRef & LocalizedConversionFrontmatter;

let checked: Promise<void> | undefined;

async function checkPairs(): Promise<void> {
  const entries = await getCollection('localized');
  const ids = new Set(entries.map((e) => e.id));
  const missing = LOCALIZED_PAGES.filter((p) => !ids.has(p.contentId)).map((p) => p.contentId);
  if (missing.length) throw new Error(`[i18n] missing localized content: ${missing.join(', ')}`);
  const listed = new Set(LOCALIZED_PAGES.map((p) => p.contentId));
  const orphans = entries.filter((e) => !listed.has(e.id)).map((e) => e.id);
  if (orphans.length)
    throw new Error(
      `[i18n] localized content not listed in localized-pages.json: ${orphans.join(', ')}`,
    );
}

export async function getLocalizedPage(ref: LocalizedPageRef): Promise<LocalizedPage> {
  checked ??= checkPairs();
  await checked;
  const entry = await getEntry('localized', ref.contentId);
  if (!entry) throw new Error(`[i18n] no content for ${ref.contentId}`);
  return { ...ref, ...entry.data };
}

export async function renderLocalizedBody(ref: LocalizedPageRef) {
  const entry = await getEntry('localized', ref.contentId);
  if (!entry) throw new Error(`[i18n] no content for ${ref.contentId}`);
  return render(entry);
}

/**
 * Related localized pages: the English page's related list (reverse conversion first),
 * restricted to pages that exist in this language, then topped up from the same category.
 */
export function relatedLocalized(ref: LocalizedPageRef, max = 6): LocalizedPageRef[] {
  const out: LocalizedPageRef[] = [];
  const add = (p: LocalizedPageRef | undefined) => {
    if (p && p.contentId !== ref.contentId && !out.includes(p)) out.push(p);
  };
  for (const slug of ref.meta.related) add(localizedPageFor(ref.locale, slug));
  const sameLocale = LOCALIZED_PAGES.filter((p) => p.locale === ref.locale);
  for (const p of sameLocale) if (p.meta.category === ref.meta.category) add(p);
  for (const p of sameLocale) add(p);
  return out.slice(0, max);
}
