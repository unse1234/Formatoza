/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_ADSENSE_CLIENT?: string;
  readonly PUBLIC_ADSENSE_SLOT_TOOL_AFTER_CONVERTER?: string;
  readonly PUBLIC_ADSENSE_SLOT_TOOL_IN_CONTENT?: string;
  readonly PUBLIC_ADSENSE_SLOT_GUIDE_IN_CONTENT?: string;
  readonly PUBLIC_AD_PLACEHOLDERS?: string;
  readonly PUBLIC_CF_BEACON_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
