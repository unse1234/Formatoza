/**
 * Converter-island localization. English is bundled; a localized page passes its own
 * dictionary as a prop, so no page ships more than one language.
 */
import { createContext, useContext } from 'react';
import { en } from '~/i18n/ui/en';
import type { Plural, UiStrings } from '~/i18n/ui/types';
import type { ConversionIssue, ErrorCode } from '~/engines/types';
import type { OptionField } from '~/engines/options';

export const UiContext = createContext<UiStrings>(en);

export function useUi(): UiStrings {
  return useContext(UiContext);
}

/** Replaces `{name}` placeholders; unknown placeholders are left as they are. */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function plural(t: UiStrings, forms: Plural, n: number): string {
  const rule = new Intl.PluralRules(t.locale).select(n);
  return fmt(rule === 'one' ? forms.one : forms.other, { n });
}

/** Settings translated through the dictionary; untranslated text falls back to English. */
export function localizeFields(fields: OptionField[], t: UiStrings): OptionField[] {
  if (!Object.keys(t.options).length) return fields;
  const tr = (s: string) => t.options[s] ?? s;
  return fields.map((f) => {
    const out = { ...f, label: tr(f.label), ...(f.help ? { help: tr(f.help) } : {}) };
    if (out.type === 'select') out.choices = out.choices.map((c) => ({ ...c, label: tr(c.label) }));
    if (out.type === 'text' && out.placeholder) out.placeholder = tr(out.placeholder);
    return out;
  });
}

/** Engines report progress in English with a few fixed patterns; map them to the page language. */
export function localizeProgress(label: string | undefined, t: UiStrings): string | undefined {
  if (!label || t === en) return label;
  let m = /^Image (\d+) of (\d+)$/.exec(label);
  if (m) return fmt(t.progress.image, { a: m[1]!, b: m[2]! });
  m = /^Page (\d+) \((\d+) of (\d+)\)$/.exec(label);
  if (m) return fmt(t.progress.pageOfRun, { p: m[1]!, a: m[2]!, b: m[3]! });
  m = /^Page (\d+) of (\d+)$/.exec(label);
  if (m) return fmt(t.progress.page, { a: m[1]!, b: m[2]! });
  return t.converting;
}

export function localizeDetail(key: string, value: string, t: UiStrings): [string, string] {
  const m = /^(\d+) of (\d+)$/.exec(value);
  return [
    t.result.detailKeys[key] ?? key,
    m && t !== en ? fmt(t.result.of, { a: m[1]!, b: m[2]! }) : value,
  ];
}

export interface IssueText {
  text: string;
  /** Engine detail kept in English (shown with lang="en"). */
  detail?: string | undefined;
  /** The text itself is English (engine warnings on a localized page). */
  english?: boolean;
}

/** Codes whose engine message carries specifics worth keeping (line numbers, limits…). */
const DETAILED: ReadonlySet<ErrorCode> = new Set([
  'MALFORMED_INPUT',
  'LIMIT_EXCEEDED',
  'BROWSER_UNSUPPORTED',
  'INTERNAL',
]);

export function describeIssue(
  issue: ConversionIssue,
  t: UiStrings,
  vars: { from: string; limit: string; max: number },
): IssueText {
  if (t === en || issue.localized) return { text: issue.message };
  if (issue.code === 'WARNING') return { text: issue.message, english: true };
  const template = t.errors[issue.code];
  if (!template) return { text: issue.message, english: true };
  return {
    text: fmt(template, vars),
    detail: DETAILED.has(issue.code) ? issue.message : undefined,
  };
}
