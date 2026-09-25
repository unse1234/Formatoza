import type { APIRoute } from 'astro';
import { ADS } from '~/config/ads';

/** Authorised digital sellers. Emits Google's line only when a publisher ID is configured. */
export const GET: APIRoute = () =>
  new Response(
    ADS.enabled
      ? `google.com, ${ADS.client.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`
      : '# No advertising sellers are authorised yet.\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
