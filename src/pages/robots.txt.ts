import type { APIRoute } from 'astro';
import { SITE } from '~/config/site';

export const GET: APIRoute = () =>
  new Response(
    [
      '# Formatoza — all public pages, scripts and styles may be crawled.',
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: ${SITE.url}/sitemap-index.xml`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
