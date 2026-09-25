/**
 * Site languages. English is the default and lives at the site root; every other
 * locale lives under `/{code}/`. Adding a locale: add it here, add its UI and page
 * dictionaries, then list pages in `src/data/localized-pages.json`
 * (see research/localization-decisions.md for how locales are chosen).
 */
export const LOCALE_CODES = ['en', 'id', 'vi', 'tr', 'pt'] as const;
export type LocaleCode = (typeof LOCALE_CODES)[number];
export type LocalizedLocaleCode = Exclude<LocaleCode, 'en'>;

export interface LocaleInfo {
  code: LocaleCode;
  /** BCP 47 value for `hreflang` and `<html lang>`. */
  hreflang: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** Language name in the language itself (used in the language switcher). */
  nativeName: string;
  englishName: string;
  /** Market status from the research: IMPLEMENT or TEST. */
  status: 'default' | 'implement' | 'test';
}

export const LOCALES: Record<LocaleCode, LocaleInfo> = {
  en: {
    code: 'en',
    hreflang: 'en',
    ogLocale: 'en_US',
    nativeName: 'English',
    englishName: 'English',
    status: 'default',
  },
  id: {
    code: 'id',
    hreflang: 'id',
    ogLocale: 'id_ID',
    nativeName: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    status: 'implement',
  },
  vi: {
    code: 'vi',
    hreflang: 'vi',
    ogLocale: 'vi_VN',
    nativeName: 'Tiếng Việt',
    englishName: 'Vietnamese',
    status: 'implement',
  },
  tr: {
    code: 'tr',
    hreflang: 'tr',
    ogLocale: 'tr_TR',
    nativeName: 'Türkçe',
    englishName: 'Turkish',
    status: 'implement',
  },
  pt: {
    code: 'pt',
    hreflang: 'pt',
    ogLocale: 'pt_BR',
    nativeName: 'Português',
    englishName: 'Portuguese',
    status: 'test',
  },
};

export const DEFAULT_LOCALE: LocaleCode = 'en';
export const LOCALIZED_LOCALES = LOCALE_CODES.filter(
  (c): c is LocalizedLocaleCode => c !== DEFAULT_LOCALE,
);

export function isLocalizedLocale(code: string): code is LocalizedLocaleCode {
  return (LOCALIZED_LOCALES as readonly string[]).includes(code);
}

/** Home path for a locale: `/` for English, `/id/` for Indonesian. */
export function localeHomePath(code: LocaleCode): string {
  return code === DEFAULT_LOCALE ? '/' : `/${code}/`;
}
