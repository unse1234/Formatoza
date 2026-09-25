import type { APIRoute } from 'astro';
import { CONVERSIONS, CATEGORIES } from '~/lib/catalog/registry';

/** Compact index for the header search (fetched on first focus). */
export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      CONVERSIONS.map((c) => ({
        p: c.path,
        t: c.h1,
        d:
          c.shortDescription.length > 90
            ? `${c.shortDescription.slice(0, 88)}…`
            : c.shortDescription,
        c: CATEGORIES[c.category].navLabel,
        k: [
          c.primaryKeyword,
          ...c.secondaryKeywords,
          c.source.name,
          c.target.name,
          c.source.fullName,
          ...c.source.extensions,
        ].join(' '),
      })),
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
