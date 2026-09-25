/**
 * JSON-LD builders. Only properties that are visible and true on the page:
 * no ratings, reviews or invented prices (the tools are genuinely free, which
 * the page states).
 */
import { SITE, absoluteUrl } from '~/config/site';
import type { CategoryInfo, ConversionMeta, FaqItem } from '~/lib/catalog/types';

type Json = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

export function organization(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    logo: absoluteUrl('/icon-512.png'),
    email: SITE.contactEmail,
  };
}

export function website(): Json {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbList(crumbs: Crumb[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Overrides for a localized page exposing the same tool. */
export interface AppOverrides {
  path?: string;
  name?: string;
  description?: string;
  inLanguage?: string;
}

export function webApplication(c: ConversionMeta, o: AppOverrides = {}): Json {
  const url = absoluteUrl(o.path ?? c.path);
  return {
    '@type': 'WebApplication',
    '@id': `${url}#app`,
    name: o.name ?? `${c.h1} — ${SITE.name}`,
    url,
    description: o.description ?? c.shortDescription,
    applicationCategory:
      c.category === 'developer' || c.category === 'data'
        ? 'DeveloperApplication'
        : 'MultimediaApplication',
    operatingSystem: 'Any (runs in a web browser)',
    browserRequirements:
      'Requires JavaScript and a current version of Chrome, Edge, Firefox or Safari.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': ORG_ID },
    inLanguage: o.inLanguage ?? SITE.lang,
  };
}

export function faqPage(faq: FaqItem[], path: string, inLanguage?: string): Json {
  return {
    '@type': 'FAQPage',
    '@id': `${absoluteUrl(path)}#faq`,
    ...(inLanguage ? { inLanguage } : {}),
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function collectionPage(cat: CategoryInfo, items: ConversionMeta[]): Json {
  return {
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(`/${cat.path}/`)}#page`,
    name: cat.name,
    description: cat.metaDescription,
    url: absoluteUrl(`/${cat.path}/`),
    isPartOf: { '@id': SITE_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(c.path),
        name: c.h1,
      })),
    },
  };
}

export function article(a: {
  title: string;
  description: string;
  path: string;
  published: Date;
  updated: Date;
}): Json {
  return {
    '@type': 'Article',
    '@id': `${absoluteUrl(a.path)}#article`,
    headline: a.title,
    description: a.description,
    url: absoluteUrl(a.path),
    datePublished: a.published.toISOString().slice(0, 10),
    dateModified: a.updated.toISOString().slice(0, 10),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: absoluteUrl(a.path),
    inLanguage: SITE.lang,
  };
}

export function graph(...nodes: Json[]): string {
  // Escape "<" so content can never close the <script> element.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(
    /</g,
    '\\u003c',
  );
}
