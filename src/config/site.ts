export const SITE = {
  name: 'Formatoza',
  /** Canonical origin without trailing slash (set PUBLIC_SITE_URL in production). */
  url: (import.meta.env.PUBLIC_SITE_URL || 'https://formatoza.com').replace(/\/+$/, ''),
  tagline: 'File conversion that happens on your device',
  description:
    'Free, private file converters that run in your browser: images, PDFs, data, subtitles, documents and developer formats. No sign-up, no uploads.',
  lang: 'en',
  locale: 'en_US',
  contactEmail: import.meta.env.PUBLIC_CONTACT_EMAIL || 'hello@formatoza.com',
  /** Date the editorial content was last reviewed (shown on tool pages). */
  contentReviewed: '2026-09-25',
  launched: '2026-09-25',
  themeColor: { light: '#fafafa', dark: '#0a0a0a' },
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE.url}/`).toString();
}
