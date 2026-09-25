/**
 * Strongly typed conversion model. `src/data/*.json` is the source of truth;
 * `registry.ts` validates it at import time and `content.ts` merges in the
 * editorial content from `src/content/conversions/*.md`.
 */

export const CATEGORY_IDS = ['image', 'pdf', 'data', 'developer', 'subtitle', 'document'] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

export const ENGINE_IDS = ['image', 'pdf', 'data', 'text', 'subtitles', 'document'] as const;
export type EngineId = (typeof ENGINE_IDS)[number];

export const FORMAT_IDS = [
  'heic', 'avif', 'webp', 'jpg', 'png', 'svg', 'gif', 'bmp', 'tiff', 'ico',
  'pdf', 'docx',
  'csv', 'tsv', 'json', 'xml', 'yaml', 'xlsx',
  'markdown', 'html', 'txt',
  'base64', 'urlencoded',
  'srt', 'vtt', 'ass',
] as const;
export type FormatId = (typeof FORMAT_IDS)[number];

export type FormatKind = 'image' | 'document' | 'data' | 'markup' | 'encoding' | 'subtitle';
export type Priority = 'P0' | 'P1' | 'P2';

/** Ordered comparison-table rows per kind of format. */
export const TRAIT_LABELS = {
  image: {
    compression: 'Compression',
    transparency: 'Transparency',
    animation: 'Animation / pages',
    colorDepth: 'Color depth',
    support: 'Where it opens',
    bestFor: 'Best for',
  },
  document: {
    structure: 'Structure',
    editability: 'Editability',
    support: 'Where it opens',
    bestFor: 'Best for',
  },
  data: {
    structure: 'Structure',
    dataTypes: 'Data types',
    nesting: 'Nesting',
    comments: 'Comments',
    support: 'Where it is used',
    bestFor: 'Best for',
  },
  markup: {
    structure: 'Structure',
    support: 'Where it is used',
    bestFor: 'Best for',
  },
  encoding: {
    alphabet: 'Alphabet',
    sizeOverhead: 'Size overhead',
    bestFor: 'Best for',
  },
  subtitle: {
    timestamps: 'Timestamps',
    styling: 'Styling',
    positioning: 'Positioning',
    support: 'Where it plays',
    bestFor: 'Best for',
  },
} as const satisfies Record<FormatKind, Record<string, string>>;

export type TraitKey = { [K in FormatKind]: keyof (typeof TRAIT_LABELS)[K] }[FormatKind];

export interface FormatInfo {
  id: FormatId;
  name: string;
  fullName: string;
  kind: FormatKind;
  extensions: string[];
  mimeTypes: string[];
  /** Plain-language explanation of the format (shown in "About X and Y"). */
  summary: string;
  traits: Partial<Record<TraitKey, string>>;
}

export interface CategoryInfo {
  id: CategoryId;
  /** URL path segment, e.g. `image-converters`. */
  path: string;
  name: string;
  navLabel: string;
  title: string;
  metaDescription: string;
  headline: string;
  intro: string;
  sections: { heading: string; body: string }[];
  guide: string;
}

/** How the converter behaves in the browser — surfaced to users as trust information. */
export type BrowserProcessingStatus =
  /** Fully local; no extra download beyond the page's own engine chunk. */
  | 'local'
  /** Fully local, but a larger decoder/renderer is downloaded on first use. */
  | 'local-lazy-assets';

export interface InputSpec {
  /** Accepted file extensions, lower-case with leading dot. */
  extensions: string[];
  mimeTypes: string[];
  /** `accept` attribute value for the file input. */
  accept: string;
  /** Text can be pasted instead of dropping a file. */
  textInput: boolean;
  multiple: boolean;
  maxFiles: number;
  maxFileBytes: number;
}

export interface OutputSpec {
  extension: string;
  mimeType: string;
  preview: 'image' | 'text' | 'html' | 'pdf' | 'binary';
  /** Several inputs produce one output file (images → PDF, CSVs → one workbook). */
  combinesInputs: boolean;
}

/** One row of `src/data/conversions.json`. */
export interface ConversionRecord {
  slug: string;
  from: FormatId;
  to: FormatId;
  category: CategoryId;
  engine: EngineId;
  priority: Priority;
  phase: number;
  title: string;
  metaDescription: string;
  h1: string;
  shortDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  semanticTerms: string[];
  related: string[];
  guide: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface UseCase {
  title: string;
  text: string;
}

/** Editorial content attached to a conversion (frontmatter of its Markdown file). */
export interface ConversionContent {
  intro: string;
  sourceExplanation?: string | undefined;
  targetExplanation?: string | undefined;
  steps?: string[] | undefined;
  useCases: UseCase[];
  limitations: string[];
  faq: FaqItem[];
}

/** Registry-level conversion: record + derived specs (no editorial prose). */
export interface ConversionMeta extends ConversionRecord {
  source: FormatInfo;
  target: FormatInfo;
  input: InputSpec;
  output: OutputSpec;
  browserProcessing: BrowserProcessingStatus;
  /** Human description of anything downloaded lazily (shown on the page). */
  lazyAssetNote?: string | undefined;
  /** Slug of the inverse conversion if we have one. */
  reverse?: string | undefined;
  path: string;
}

/** Fully assembled conversion used by page templates. */
export interface Conversion extends ConversionMeta, ConversionContent {
  sourceExplanation: string;
  targetExplanation: string;
  steps: string[];
}

/**
 * The minimal, serialisable subset passed to the client-side converter island.
 * Keep this small: it is inlined into every tool page's HTML.
 */
export interface ClientConversion {
  slug: string;
  from: FormatId;
  to: FormatId;
  fromName: string;
  toName: string;
  engine: EngineId;
  input: InputSpec;
  output: OutputSpec;
}
