import { SITE, absoluteUrl } from '~/config/site';

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
  };
  publishedTime?: string | undefined;
  modifiedTime?: string | undefined;
}

export function resolveMeta(m: PageMeta): ResolvedMeta {
  if (!m.path.startsWith('/') || !m.path.endsWith('/'))
    throw new Error(`[seo] path must start and end with "/": ${m.path}`);
  const title = m.brandSuffix === false ? m.title : `${m.title} | ${SITE.name}`;
  const canonical = absoluteUrl(m.path);
  const image = absoluteUrl(m.image ?? '/og/default.png');
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
      locale: SITE.locale,
    },
    publishedTime: m.publishedTime,
    modifiedTime: m.modifiedTime,
  };
}
