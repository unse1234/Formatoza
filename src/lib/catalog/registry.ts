/**
 * Build-time and test-time catalog: validated JSON data + derived specs.
 * Pure data, no Astro APIs, safe to import from tests and scripts.
 */
import conversionsJson from '~/data/conversions.json';
import formatsJson from '~/data/supported-formats.json';
import categoriesJson from '~/data/categories.json';
import { engineSupports } from '~/engines/manifest';
import {
  CATEGORY_IDS,
  ENGINE_IDS,
  FORMAT_IDS,
  type CategoryId,
  type CategoryInfo,
  type ClientConversion,
  type ConversionMeta,
  type ConversionRecord,
  type FormatId,
  type FormatInfo,
  type InputSpec,
  type OutputSpec,
} from './types';

const MB = 1024 * 1024;

class CatalogError extends Error {
  constructor(message: string) {
    super(`[catalog] ${message}`);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new CatalogError(message);
}

// ---------------------------------------------------------------- formats
export const FORMATS: Record<FormatId, FormatInfo> = (() => {
  const raw = formatsJson as Record<string, Omit<FormatInfo, 'id'>>;
  const out = {} as Record<FormatId, FormatInfo>;
  for (const id of FORMAT_IDS) {
    const f = raw[id];
    assert(f, `format "${id}" missing from supported-formats.json`);
    assert(
      f.extensions.every((e) => e.startsWith('.') && e === e.toLowerCase()),
      `format ${id}: bad extensions`,
    );
    assert(f.summary.length > 200, `format ${id}: summary too short`);
    out[id] = { id, ...f };
  }
  for (const id of Object.keys(raw))
    assert((FORMAT_IDS as readonly string[]).includes(id), `unknown format "${id}"`);
  return out;
})();

// ------------------------------------------------------------- categories
export const CATEGORIES: Record<CategoryId, CategoryInfo> = (() => {
  const raw = categoriesJson as Record<string, Omit<CategoryInfo, 'id'>>;
  const out = {} as Record<CategoryId, CategoryInfo>;
  for (const id of CATEGORY_IDS) {
    const c = raw[id];
    assert(c, `category "${id}" missing from categories.json`);
    assert(/^[a-z-]+$/.test(c.path), `category ${id}: bad path`);
    out[id] = { id, ...c };
  }
  return out;
})();

export const CATEGORY_LIST: CategoryInfo[] = CATEGORY_IDS.map((id) => CATEGORIES[id]);

// ------------------------------------------------------------ input/output
function uniq<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

function inputSpec(r: ConversionRecord): InputSpec {
  const src = FORMATS[r.from];
  let extensions = [...src.extensions];
  let mimeTypes = [...src.mimeTypes];
  // Text-ish sources: also accept generic text files, since people save pasted data as .txt.
  if (['base64', 'urlencoded', 'txt'].includes(r.from)) {
    extensions = uniq([...extensions, '.txt', '.text', '.log']);
    mimeTypes = uniq([...mimeTypes, 'text/plain']);
  }
  if (r.from === 'tsv') extensions = uniq([...extensions, '.txt']);
  if (r.from === 'json' && r.to === 'base64') extensions = uniq([...extensions, '.txt']);

  const base = { extensions, mimeTypes, accept: uniq([...extensions, ...mimeTypes]).join(',') };

  switch (r.engine) {
    case 'image': {
      const perFile = r.from === 'tiff' ? 150 : r.from === 'heic' ? 60 : 80;
      return {
        ...base,
        textInput: r.from === 'svg',
        multiple: true,
        maxFiles: 50,
        maxFileBytes: perFile * MB,
      };
    }
    case 'pdf':
      return r.from === 'pdf'
        ? { ...base, textInput: false, multiple: false, maxFiles: 1, maxFileBytes: 200 * MB }
        : { ...base, textInput: false, multiple: true, maxFiles: 100, maxFileBytes: 60 * MB };
    case 'data':
      return { ...base, textInput: true, multiple: true, maxFiles: 20, maxFileBytes: 60 * MB };
    case 'text':
      return { ...base, textInput: true, multiple: true, maxFiles: 20, maxFileBytes: 15 * MB };
    case 'subtitles':
      return { ...base, textInput: true, multiple: true, maxFiles: 50, maxFileBytes: 10 * MB };
    case 'document':
      return { ...base, textInput: false, multiple: true, maxFiles: 10, maxFileBytes: 60 * MB };
  }
}

const OUTPUT_EXTENSION: Partial<Record<FormatId, string>> = {
  jpg: '.jpg',
  markdown: '.md',
  yaml: '.yaml',
  tiff: '.tiff',
  base64: '.txt',
  urlencoded: '.txt',
};

function outputSpec(r: ConversionRecord): OutputSpec {
  const t = FORMATS[r.to];
  const extension = OUTPUT_EXTENSION[r.to] ?? t.extensions[0]!;
  const mimeType = t.mimeTypes[0]!;
  const preview: OutputSpec['preview'] =
    t.kind === 'image'
      ? 'image'
      : r.to === 'pdf'
        ? 'pdf'
        : r.to === 'html'
          ? 'html'
          : r.to === 'xlsx'
            ? 'binary'
            : 'text';
  return { extension, mimeType, preview, combinesInputs: r.to === 'pdf' || r.to === 'xlsx' };
}

function lazyAssets(
  r: ConversionRecord,
): Pick<ConversionMeta, 'browserProcessing' | 'lazyAssetNote'> {
  if (r.from === 'heic')
    return {
      browserProcessing: 'local-lazy-assets',
      lazyAssetNote:
        'Safari 17+ decodes HEIC natively. Other browsers download a one-time HEIC decoder (about 700 KB) the first time you convert; it runs on your device.',
    };
  if (r.from === 'pdf')
    return {
      browserProcessing: 'local-lazy-assets',
      lazyAssetNote:
        'The PDF.js renderer (about 530 KB) is downloaded when you convert your first PDF and runs on your device.',
    };
  if (r.to === 'pdf')
    return {
      browserProcessing: 'local-lazy-assets',
      lazyAssetNote:
        'A PDF writer library (about 160 KB) is downloaded when you start converting and runs on your device.',
    };
  if (r.from === 'docx')
    return {
      browserProcessing: 'local-lazy-assets',
      lazyAssetNote:
        'A DOCX reader (about 120 KB) is downloaded when you convert your first document and runs on your device.',
    };
  return { browserProcessing: 'local' };
}

// ------------------------------------------------------------ conversions
export const CONVERSIONS: ConversionMeta[] = (() => {
  const records = conversionsJson as ConversionRecord[];
  const slugs = new Set<string>();
  const pairKeys = new Set<string>();
  for (const r of records) {
    assert(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug), `bad slug "${r.slug}"`);
    assert(!slugs.has(r.slug), `duplicate slug "${r.slug}"`);
    slugs.add(r.slug);
    const pairKey = `${r.from}>${r.to}`;
    assert(!pairKeys.has(pairKey), `duplicate conversion pair ${pairKey}`);
    pairKeys.add(pairKey);
    assert(
      (FORMAT_IDS as readonly string[]).includes(r.from),
      `${r.slug}: unknown source ${r.from}`,
    );
    assert((FORMAT_IDS as readonly string[]).includes(r.to), `${r.slug}: unknown target ${r.to}`);
    assert((CATEGORY_IDS as readonly string[]).includes(r.category), `${r.slug}: unknown category`);
    assert((ENGINE_IDS as readonly string[]).includes(r.engine), `${r.slug}: unknown engine`);
    assert(
      engineSupports(r.engine, r.from, r.to),
      `${r.slug}: engine ${r.engine} can't do ${pairKey}`,
    );
    assert(
      r.title.length > 20 && r.title.length <= 58,
      `${r.slug}: title length ${r.title.length}`,
    );
    assert(
      r.metaDescription.length >= 110 && r.metaDescription.length <= 160,
      `${r.slug}: meta length`,
    );
    assert(
      r.secondaryKeywords.length >= 3 && r.secondaryKeywords.length <= 8,
      `${r.slug}: 3–8 secondary keywords`,
    );
    assert(
      r.semanticTerms.length >= 2 && r.semanticTerms.length <= 5,
      `${r.slug}: 2–5 semantic terms`,
    );
    assert(r.related.length >= 4 && r.related.length <= 8, `${r.slug}: 4–8 related`);
    assert(!r.related.includes(r.slug), `${r.slug}: relates to itself`);
  }
  for (const r of records)
    for (const rel of r.related) assert(slugs.has(rel), `${r.slug}: unknown related "${rel}"`);

  return records.map((r) => {
    const reverse = records.find((o) => o.from === r.to && o.to === r.from)?.slug;
    // Reverse conversion always comes first in related links.
    const related = reverse ? [reverse, ...r.related.filter((s) => s !== reverse)] : r.related;
    return {
      ...r,
      related,
      reverse,
      source: FORMATS[r.from],
      target: FORMATS[r.to],
      input: inputSpec(r),
      output: outputSpec(r),
      ...lazyAssets(r),
      path: `/${r.slug}/`,
    };
  });
})();

const BY_SLUG = new Map(CONVERSIONS.map((c) => [c.slug, c]));

export function getConversionMeta(slug: string): ConversionMeta {
  const c = BY_SLUG.get(slug);
  if (!c) throw new CatalogError(`unknown conversion "${slug}"`);
  return c;
}

export function conversionsInCategory(id: CategoryId): ConversionMeta[] {
  return CONVERSIONS.filter((c) => c.category === id);
}

export function categoryPath(id: CategoryId): string {
  return `/${CATEGORIES[id].path}/`;
}

export function toClientConversion(c: ConversionMeta): ClientConversion {
  return {
    slug: c.slug,
    from: c.from,
    to: c.to,
    fromName: c.source.name,
    toName: c.target.name,
    engine: c.engine,
    input: c.input,
    output: c.output,
  };
}
