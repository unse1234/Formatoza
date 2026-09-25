/**
 * Astro-only: assembles full `Conversion` objects (registry + editorial content).
 */
import { getCollection, getEntry, render } from 'astro:content';
import { CONVERSIONS, getConversionMeta } from './registry';
import type { Conversion, ConversionMeta } from './types';
import { defaultSteps } from './steps';

let cache: Promise<Map<string, Conversion>> | undefined;

async function build(): Promise<Map<string, Conversion>> {
  const entries = await getCollection('conversions');
  const byId = new Map(entries.map((e) => [e.id, e]));
  const missing = CONVERSIONS.filter((c) => !byId.has(c.slug)).map((c) => c.slug);
  if (missing.length) throw new Error(`[catalog] missing content for: ${missing.join(', ')}`);
  const orphans = entries.filter((e) => !CONVERSIONS.some((c) => c.slug === e.id)).map((e) => e.id);
  if (orphans.length)
    throw new Error(`[catalog] content without catalog entry: ${orphans.join(', ')}`);

  return new Map(
    CONVERSIONS.map((meta) => {
      const data = byId.get(meta.slug)!.data;
      const full: Conversion = {
        ...meta,
        ...data,
        sourceExplanation: data.sourceExplanation ?? meta.source.summary,
        targetExplanation: data.targetExplanation ?? meta.target.summary,
        steps: data.steps ?? defaultSteps(meta),
      };
      return [meta.slug, full];
    }),
  );
}

export async function getConversions(): Promise<Conversion[]> {
  cache ??= build();
  return [...(await cache).values()];
}

export async function getConversion(slug: string): Promise<Conversion> {
  cache ??= build();
  const c = (await cache).get(slug);
  if (!c) throw new Error(`[catalog] unknown conversion ${slug}`);
  return c;
}

/** Renders the Markdown body (conversion-specific deep-dive sections). */
export async function renderConversionBody(slug: string) {
  const entry = await getEntry('conversions', slug);
  if (!entry) throw new Error(`[catalog] no content entry for ${slug}`);
  return render(entry);
}

export function relatedMetas(c: ConversionMeta): ConversionMeta[] {
  return c.related.map((s) => getConversionMeta(s));
}
