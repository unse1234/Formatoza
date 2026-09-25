import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  conversionContentSchema,
  guideSchema,
  localizedConversionSchema,
} from '~/lib/catalog/content-schema';

const conversions = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/conversions' }),
  schema: conversionContentSchema,
});

const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: guideSchema,
});

// Localized tool pages; ids are `{locale}/{slug}` (see src/data/localized-pages.json).
const localized = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/localized' }),
  schema: localizedConversionSchema,
});

export const collections = { conversions, guides, localized };
