import { SITE, absoluteUrl } from '~/config/site';
import { LOCALES, type LocaleCode } from '~/i18n/locales';
import type { Alternate } from '~/i18n/registry';

export interface PageMeta {
  title: string;
  description: string;
  /** Path with leading and trailing slash, e.g. `/heic-to-jpg/`. */
  path: string;
  /** Include the " | Formatoza" suffix (default true). */
  brandSuffix?: boolean;
  type?: 'website' | 'article';
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  /** Page language (default English). */
  locale?: LocaleCode;
  /** hreflang alternates, including this page; empty or absent for single-language pages. */
  alternates?: Alternate[];
}

export interface ResolvedMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  og: {
    type: string;
    title: string;
    description: string;
    url: string;
    image: string;
    imageAlt: string;
    siteName: string;
    locale: string;
    localeAlternates: string[];
  };
  alternates: { hreflang: string; href: string }[];
  publishedTime?: string | undefined;
  modifiedTime?: string | undefined;
}

export function resolveMeta(m: PageMeta): ResolvedMeta {
  if (!m.path.startsWith('/') || !m.path.endsWith('/'))
    throw new Error(`[seo] path must start and end with "/": ${m.path}`);
  const title = m.brandSuffix === false ? m.title : `${m.title} | ${SITE.name}`;
  const canonical = absoluteUrl(m.path);
  const image = absoluteUrl(m.image ?? '/og/default.png');
  const locale = LOCALES[m.locale ?? 'en'];
  const alternates = (m.alternates ?? []).map((a) => ({
    hreflang: a.hreflang,
    href: absoluteUrl(a.href),
  }));
  if (alternates.length && !alternates.some((a) => a.href === canonical))
    throw new Error(`[seo] hreflang set for ${m.path} does not include the page itself`);
  return {
    title,
    description: m.description,
    canonical,
    robots: m.noindex
      ? 'noindex, follow'
      : 'index, follow, max-image-preview:large, max-snippet:-1',
    og: {
      type: m.type ?? 'website',
      title: m.title,
      description: m.description,
      url: canonical,
      image,
      imageAlt: m.imageAlt ?? `${SITE.name} — ${SITE.tagline}`,
      siteName: SITE.name,
      locale: locale.ogLocale,
      localeAlternates: (m.alternates ?? [])
        .filter((a) => a.locale !== 'x-default' && a.locale !== locale.code)
        .map((a) => LOCALES[a.locale as LocaleCode].ogLocale),
    },
    alternates,
    publishedTime: m.publishedTime,
    modifiedTime: m.modifiedTime,
  };
}
