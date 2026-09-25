import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { conversionContentSchema, guideSchema } from '~/lib/catalog/content-schema';

const conversions = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/conversions' }),
  schema: conversionContentSchema,
});

const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: guideSchema,
});

export const collections = { conversions, guides };
