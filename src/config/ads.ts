/**
 * AdSense configuration. Nothing is hard-coded: with no env vars set, no ad
 * code, script or meta tag is emitted anywhere. See README → "Enabling ads".
 */
export type AdPlacement = 'toolAfterConverter' | 'toolInContent' | 'guideInContent';

const client = (import.meta.env.PUBLIC_ADSENSE_CLIENT ?? '').trim();
const CLIENT_PATTERN = /^ca-pub-\d{10,20}$/;

if (client && !CLIENT_PATTERN.test(client)) {
  console.warn(
    `[ads] PUBLIC_ADSENSE_CLIENT "${client}" is not a valid publisher ID (ca-pub-…); ads stay disabled.`,
  );
}

const slots: Record<AdPlacement, string> = {
  toolAfterConverter: (import.meta.env.PUBLIC_ADSENSE_SLOT_TOOL_AFTER_CONVERTER ?? '').trim(),
  toolInContent: (import.meta.env.PUBLIC_ADSENSE_SLOT_TOOL_IN_CONTENT ?? '').trim(),
  guideInContent: (import.meta.env.PUBLIC_ADSENSE_SLOT_GUIDE_IN_CONTENT ?? '').trim(),
};

export const ADS = {
  client: CLIENT_PATTERN.test(client) ? client : '',
  slots,
  /** Show labelled placeholder boxes (design review only; never enable in production). */
  placeholders: import.meta.env.PUBLIC_AD_PLACEHOLDERS === 'true',
  get enabled(): boolean {
    return this.client !== '';
  },
  slotFor(placement: AdPlacement): string {
    const id = this.slots[placement];
    return this.enabled && /^\d{6,20}$/.test(id) ? id : '';
  },
};
