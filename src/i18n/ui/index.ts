/** Build-time map of converter UI dictionaries. Pages pass only their own to the island. */
import type { LocalizedLocaleCode } from '../locales';
import type { UiStrings } from './types';
import type { ConversionMeta } from '~/lib/catalog/types';
import { getOptionFields } from '~/engines/options';
import { id } from './id';
import { pt } from './pt';
import { tr } from './tr';
import { vi } from './vi';

export const UI_STRINGS: Record<LocalizedLocaleCode, UiStrings> = { id, vi, tr, pt };

/**
 * The dictionary a page actually needs: settings text is limited to the fields of this
 * conversion, so the serialised island prop stays small.
 */
export function uiStringsFor(locale: LocalizedLocaleCode, c: ConversionMeta): UiStrings {
  const t = UI_STRINGS[locale];
  const used = new Set<string>();
  for (const f of getOptionFields(c.engine, c.from, c.to)) {
    used.add(f.label);
    if (f.help) used.add(f.help);
    if (f.type === 'select') for (const ch of f.choices) used.add(ch.label);
    if (f.type === 'text' && f.placeholder) used.add(f.placeholder);
  }
  return {
    ...t,
    options: Object.fromEntries(Object.entries(t.options).filter(([k]) => used.has(k))),
  };
}
