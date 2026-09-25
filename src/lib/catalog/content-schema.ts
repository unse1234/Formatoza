/**
 * Frontmatter schemas for editorial content. Shared by Astro content
 * collections (build-time validation) and the catalog tests.
 */
import { z } from 'astro/zod';

const sentence = z.string().trim().min(20);

export const conversionContentSchema = z.object({
  /** 60–250 word original introduction; rendered as the lead paragraph(s). */
  intro: z.string().trim().min(250),
  /** Optional conversion-specific overrides of the shared format explanations. */
  sourceExplanation: z.string().trim().min(80).optional(),
  targetExplanation: z.string().trim().min(80).optional(),
  /** Optional custom "How to convert" steps; otherwise generated from the tool's settings. */
  steps: z.array(sentence).min(3).max(7).optional(),
  useCases: z
    .array(z.object({ title: z.string().trim().min(3), text: sentence }))
    .min(3)
    .max(6),
  limitations: z.array(sentence).min(3).max(8),
  faq: z
    .array(z.object({ q: z.string().trim().min(10).endsWith('?'), a: sentence }))
    .min(3)
    .max(8),
});

export type ConversionContentFrontmatter = z.infer<typeof conversionContentSchema>;

export const guideSchema = z.object({
  title: z.string().trim().min(20).max(70),
  metaDescription: z.string().trim().min(110).max(160),
  h1: z.string().trim().min(10),
  summary: z.string().trim().min(60),
  category: z.enum(['image', 'pdf', 'data', 'developer', 'subtitle', 'document']),
  published: z.coerce.date(),
  updated: z.coerce.date(),
  tools: z.array(z.string()).min(2),
});

export type GuideFrontmatter = z.infer<typeof guideSchema>;

/**
 * Localized tool page (`src/content/localized/{locale}/{slug}.md`). Written for the market,
 * not machine-translated: every field is required, including steps, because the English
 * steps are generated from English setting labels.
 */
export const localizedConversionSchema = z.object({
  title: z.string().trim().min(25).max(60),
  metaDescription: z.string().trim().min(110).max(160),
  h1: z.string().trim().min(10).max(70),
  shortDescription: z.string().trim().min(60).max(220),
  intro: z.string().trim().min(250),
  steps: z.array(sentence).min(3).max(7),
  sourceExplanation: z.string().trim().min(80),
  targetExplanation: z.string().trim().min(80),
  useCases: z
    .array(z.object({ title: z.string().trim().min(3), text: sentence }))
    .min(2)
    .max(6),
  limitations: z.array(sentence).min(2).max(8),
  faq: z
    .array(z.object({ q: z.string().trim().min(10).endsWith('?'), a: sentence }))
    .min(2)
    .max(8),
});

export type LocalizedConversionFrontmatter = z.infer<typeof localizedConversionSchema>;
