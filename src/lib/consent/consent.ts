/**
 * Consent architecture.
 *
 * 1. Before any Google tag loads, Consent Mode v2 defaults are set: ad and
 *    analytics storage are denied in the EEA, UK and Switzerland until the
 *    visitor decides.
 * 2. AdSense's Google-certified CMP (Privacy & Messaging, configured in the
 *    AdSense UI) is served by the AdSense script itself and updates consent.
 * 3. The footer "Privacy choices" button re-opens that message via the
 *    googlefc API, or falls back to the cookie policy page.
 *
 * Nothing here runs when ads are not configured.
 */
export const CONSENT_REGIONS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'IS', 'LI', 'NO', // EEA
  'GB', 'CH',
] as const;

/** Inline script (runs before the AdSense tag) that sets Consent Mode v2 defaults. */
export function consentDefaultsScript(): string {
  const regions = JSON.stringify(CONSENT_REGIONS);
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${regions},wait_for_update:500});`,
    "gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'denied'});",
    "gtag('set','ads_data_redaction',true);",
    // Google Privacy & Messaging queue (populated by the AdSense script when the CMP is enabled).
    'window.googlefc=window.googlefc||{};window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];',
  ].join('');
}
