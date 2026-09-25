/**
 * Localization: registry integrity, dictionary completeness, localized content quality and
 * the island's i18n helpers.
 */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { localizedConversionSchema } from '~/lib/catalog/content-schema';
import { getOptionFields } from '~/engines/options';
import {
  ACTIVE_LOCALES,
  LOCALIZED_PAGES,
  conversionAlternates,
  homeAlternates,
} from '~/i18n/registry';
import { LOCALES, LOCALIZED_LOCALES } from '~/i18n/locales';
import { UI_STRINGS, uiStringsFor } from '~/i18n/ui';
import { en } from '~/i18n/ui/en';
import { PAGE_STRINGS } from '~/i18n/pages';
import type { ErrorCode } from '~/engines/types';
import {
  describeIssue,
  fmt,
  localizeDetail,
  localizeFields,
  localizeProgress,
  plural,
} from '~/components/converter/i18n';

const CONTENT = join(__dirname, '..', '..', 'src', 'content');
const ERROR_CODES: ErrorCode[] = [
  'EMPTY_INPUT',
  'UNSUPPORTED_FORMAT',
  'FILE_TOO_LARGE',
  'TOO_MANY_FILES',
  'MALFORMED_INPUT',
  'BROWSER_UNSUPPORTED',
  'LIMIT_EXCEEDED',
  'ENCRYPTED',
  'ABORTED',
  'INTERNAL',
];

function frontmatter(path: string): Record<string, unknown> {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(readFileSync(path, 'utf8'));
  if (!m) throw new Error(`${path}: no frontmatter`);
  return load(m[1]!) as Record<string, unknown>;
}

const pages = LOCALIZED_PAGES.map((p) => ({
  ...p,
  data: localizedConversionSchema.parse(
    frontmatter(join(CONTENT, 'localized', p.locale, `${p.slug}.md`)),
  ),
  english: frontmatter(join(CONTENT, 'conversions', `${p.conversion}.md`)),
}));

/** Key paths of a nested object, ignoring free-form maps. */
function shape(o: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) =>
    ['options', 'errors', 'detailKeys'].includes(k)
      ? [prefix + k]
      : v && typeof v === 'object'
        ? shape(v as Record<string, unknown>, `${prefix}${k}.`)
        : [prefix + k],
  );
}

describe('localized page registry', () => {
  it('lists pages only for real conversions, with content for each and nothing extra', () => {
    expect(LOCALIZED_PAGES.length).toBeGreaterThan(0);
    for (const p of LOCALIZED_PAGES)
      expect(existsSync(join(CONTENT, 'localized', p.locale, `${p.slug}.md`)), p.contentId).toBe(
        true,
      );
    for (const locale of readdirSync(join(CONTENT, 'localized')))
      for (const f of readdirSync(join(CONTENT, 'localized', locale)))
        expect(
          LOCALIZED_PAGES.some((p) => p.contentId === `${locale}/${f.replace(/\.md$/, '')}`),
          `${locale}/${f} is not listed in localized-pages.json`,
        ).toBe(true);
  });

  it('keeps localized slugs distinct from English slugs (no copies under a prefix)', () => {
    for (const p of LOCALIZED_PAGES) expect(p.slug, p.contentId).not.toBe(p.conversion);
  });

  it('builds reciprocal hreflang sets with self-reference and an English x-default', () => {
    for (const p of LOCALIZED_PAGES) {
      const alts = conversionAlternates(p.conversion);
      expect(alts.map((a) => a.href)).toContain(p.path);
      expect(alts.find((a) => a.locale === 'x-default')?.href).toBe(`/${p.conversion}/`);
      expect(new Set(alts.map((a) => a.hreflang)).size).toBe(alts.length);
      for (const other of LOCALIZED_PAGES.filter((x) => x.conversion === p.conversion))
        expect(conversionAlternates(other.conversion)).toEqual(alts);
    }
    expect(conversionAlternates('png-to-jpg')).toEqual([]);
    expect(homeAlternates().map((a) => a.href)).toEqual([
      '/',
      ...ACTIVE_LOCALES.map((l) => `/${l}/`),
      '/',
    ]);
  });
});

describe('converter UI dictionaries', () => {
  it('have exactly the same structure as English', () => {
    for (const l of LOCALIZED_LOCALES)
      expect(shape(UI_STRINGS[l] as never), l).toEqual(shape(en as never));
  });

  it('explain every error code in every language', () => {
    for (const l of LOCALIZED_LOCALES)
      for (const code of ERROR_CODES)
        expect(UI_STRINGS[l].errors[code], `${l} ${code}`).toBeTruthy();
  });

  it('translate every setting used by each localized page', () => {
    const missing: string[] = [];
    for (const p of LOCALIZED_PAGES) {
      const t = UI_STRINGS[p.locale].options;
      for (const f of getOptionFields(p.meta.engine, p.meta.from, p.meta.to)) {
        const strings = [
          f.label,
          ...(f.help ? [f.help] : []),
          ...(f.type === 'select' ? f.choices.map((c) => c.label) : []),
          ...(f.type === 'text' && f.placeholder ? [f.placeholder] : []),
        ];
        for (const s of strings) if (!t[s]) missing.push(`${p.contentId}: "${s}"`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('keep placeholders intact in translations', () => {
    const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const walk = (a: unknown, b: unknown, path: string, out: string[]) => {
      if (typeof a === 'string' && typeof b === 'string') {
        if (path.startsWith('errors') || path.startsWith('options')) return;
        if (placeholders(a).join() !== placeholders(b).join()) out.push(path);
      } else if (a && b && typeof a === 'object')
        for (const k of Object.keys(a)) walk((a as never)[k], (b as never)[k], `${path}${k}.`, out);
    };
    for (const l of LOCALIZED_LOCALES) {
      const out: string[] = [];
      walk(en, UI_STRINGS[l], '', out);
      expect(out, l).toEqual([]);
    }
  });

  it('ship only the settings text a page needs', () => {
    const p = LOCALIZED_PAGES.find((x) => x.conversion === 'srt-to-vtt')!;
    const t = uiStringsFor(p.locale, p.meta);
    expect(Object.keys(t.options).length).toBeLessThanOrEqual(2);
    expect(t.options['Quality']).toBeUndefined();
  });
});

describe('localized content', () => {
  it('puts the researched keyword in the title or H1', () => {
    for (const p of pages)
      expect(`${p.data.title} ${p.data.h1}`.toLowerCase(), p.contentId).toContain(p.keyword);
  });

  it('has unique titles, descriptions and H1s within a language', () => {
    for (const l of LOCALIZED_LOCALES)
      for (const key of ['title', 'metaDescription', 'h1'] as const) {
        const values = pages.filter((p) => p.locale === l).map((p) => p.data[key].toLowerCase());
        expect(new Set(values).size, `${l} ${key}`).toBe(values.length);
      }
  });

  it('is written for the language, not copied from English', () => {
    for (const p of pages) {
      const english = p.english as { intro: string; faq: { q: string }[] };
      expect(p.data.intro).not.toBe(english.intro);
      for (const f of p.data.faq)
        expect(
          english.faq.map((x) => x.q),
          p.contentId,
        ).not.toContain(f.q);
      // Localized copy should use the language's own words, not English prose.
      expect(p.data.intro, p.contentId).not.toMatch(
        /\b(the|and|your|with|this)\b.*\b(the|and|your)\b/,
      );
    }
  });

  it('does not reuse the same intro or FAQ across pages', () => {
    const intros = pages.map((p) => p.data.intro);
    expect(new Set(intros).size).toBe(intros.length);
    const qs = pages.flatMap((p) => p.data.faq.map((f) => `${p.locale} ${f.q}`));
    expect(new Set(qs).size).toBe(qs.length);
  });

  it('has hub metadata within search-result limits', () => {
    for (const l of LOCALIZED_LOCALES) {
      const h = PAGE_STRINGS[l].hub;
      expect(h.title.length, l).toBeLessThanOrEqual(60);
      expect(h.metaDescription.length, l).toBeGreaterThanOrEqual(110);
      expect(h.metaDescription.length, l).toBeLessThanOrEqual(160);
    }
  });

  it('has a category label for every category it uses', () => {
    for (const p of LOCALIZED_PAGES)
      expect(PAGE_STRINGS[p.locale].categories[p.meta.category], p.contentId).toBeTruthy();
  });

  it('uses valid locale metadata', () => {
    for (const l of LOCALIZED_LOCALES) {
      expect(LOCALES[l].hreflang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      expect(LOCALES[l].ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
    }
  });
});

describe('island i18n helpers', () => {
  const id = UI_STRINGS.id;
  const pt = UI_STRINGS.pt;
  const vars = { from: 'HEIC', limit: '60 MB', max: 50 };

  it('formats placeholders and plurals', () => {
    expect(fmt('Convert {n} files to {to}', { n: 3, to: 'JPG' })).toBe('Convert 3 files to JPG');
    expect(fmt('{missing} stays', {})).toBe('{missing} stays');
    expect(plural(en, en.files, 1)).toBe('1 file');
    expect(plural(en, en.files, 2)).toBe('2 files');
    expect(plural(pt, pt.files, 1)).toBe('1 arquivo');
    expect(plural(pt, pt.files, 4)).toBe('4 arquivos');
    expect(plural(id, id.files, 4)).toBe('4 file');
  });

  it('keeps English issues untouched and localizes by error code elsewhere', () => {
    const issue = {
      code: 'UNSUPPORTED_FORMAT' as const,
      message: "This doesn't look like a HEIC file.",
    };
    expect(describeIssue(issue, en, vars)).toEqual({ text: issue.message });
    expect(describeIssue(issue, id, vars).text).toBe('File ini sepertinya bukan file HEIC.');
    const malformed = { code: 'MALFORMED_INPUT' as const, message: 'Invalid JSON at line 3' };
    expect(describeIssue(malformed, pt, { ...vars, from: 'JSON' })).toEqual({
      text: 'Não foi possível ler este arquivo como JSON válido.',
      detail: 'Invalid JSON at line 3',
    });
    expect(
      describeIssue(
        { code: 'EMPTY_INPUT', message: 'Cole algum texto primeiro.', localized: true },
        pt,
        vars,
      ).text,
    ).toBe('Cole algum texto primeiro.');
    expect(describeIssue({ code: 'WARNING', message: 'Metadata removed' }, id, vars)).toEqual({
      text: 'Metadata removed',
      english: true,
    });
  });

  it('localizes engine progress labels and result details', () => {
    expect(localizeProgress('Page 3 of 12', UI_STRINGS.tr)).toBe('Sayfa 3/12');
    expect(localizeProgress('Image 2 of 5', id)).toBe('Gambar 2 dari 5');
    expect(localizeProgress('Page 4 (2 of 3)', pt)).toBe('Página 4 (2 de 3)');
    expect(localizeProgress('Decoding…', id)).toBe(id.converting);
    expect(localizeProgress('Page 3 of 12', en)).toBe('Page 3 of 12');
    expect(localizeDetail('Page', '3 of 12', UI_STRINGS.vi)).toEqual(['Trang', '3/12']);
    expect(localizeDetail('Dimensions', '10 × 20', en)).toEqual(['Dimensions', '10 × 20']);
  });

  it('translates settings and falls back to English for unknown text', () => {
    const fields = getOptionFields('image', 'heic', 'jpg');
    const out = localizeFields(fields, UI_STRINGS.tr);
    expect(out.find((f) => f.key === 'quality')?.label).toBe('Kalite');
    expect(localizeFields(fields, en)).toBe(fields);
    expect(
      localizeFields([{ key: 'x', label: 'Unknown', type: 'boolean', default: false }], id)[0]!
        .label,
    ).toBe('Unknown');
  });
});
