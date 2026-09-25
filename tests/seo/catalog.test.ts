import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { CATEGORIES, CONVERSIONS } from '~/lib/catalog/registry';
import { conversionContentSchema, guideSchema } from '~/lib/catalog/content-schema';
import { engineSupports } from '~/engines/manifest';

const ROOT = join(__dirname, '..', '..', 'src', 'content');

function readEntries(dir: string) {
  return readdirSync(join(ROOT, dir))
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = readFileSync(join(ROOT, dir, f), 'utf8');
      const m = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
      if (!m) throw new Error(`${f}: no frontmatter`);
      return {
        id: f.replace(/\.md$/, ''),
        data: load(m[1]!) as Record<string, unknown>,
        body: m[2]!,
      };
    });
}

const conversions = readEntries('conversions');
const guides = readEntries('guides');
const byId = new Map(conversions.map((c) => [c.id, c]));

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9À-￿]+/g, ' ')
    .trim()
    .split(' ');
function shingles(s: string, n = 4): Set<string> {
  const w = words(s);
  const out = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) out.add(w.slice(i, i + n).join(' '));
  return out;
}
function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

describe('catalog', () => {
  it('has the 60 core launch URLs plus the document tools', () => {
    expect(CONVERSIONS).toHaveLength(63);
    const core = JSON.parse(
      readFileSync(
        join(__dirname, '..', '..', 'converter-site-kit', 'conversion-catalog.json'),
        'utf8',
      ),
    ).launchCore as { slug: string }[];
    const ours = new Set(CONVERSIONS.map((c) => c.slug));
    const missing = core.map((c) => c.slug).filter((s) => !ours.has(s));
    // EPUB tools are deliberately deferred (see README).
    expect(missing).toEqual(['epub-to-html', 'epub-to-txt']);
  });
  it('every conversion is supported by its engine and has valid related links', () => {
    for (const c of CONVERSIONS) {
      expect(engineSupports(c.engine, c.from, c.to), c.slug).toBe(true);
      expect(c.related.length).toBeGreaterThanOrEqual(4);
      if (c.reverse) expect(c.related[0]).toBe(c.reverse);
    }
  });
  it('titles, meta descriptions and H1s are unique', () => {
    const titles = [
      ...CONVERSIONS.map((c) => c.title),
      ...Object.values(CATEGORIES).map((c) => c.title),
      ...guides.map((g) => g.data['title'] as string),
    ];
    const metas = [
      ...CONVERSIONS.map((c) => c.metaDescription),
      ...Object.values(CATEGORIES).map((c) => c.metaDescription),
      ...guides.map((g) => g.data['metaDescription'] as string),
    ];
    const h1s = [
      ...CONVERSIONS.map((c) => c.h1),
      ...Object.values(CATEGORIES).map((c) => c.headline),
      ...guides.map((g) => g.data['h1'] as string),
    ];
    for (const list of [titles, metas, h1s])
      expect(new Set(list.map((x) => x.toLowerCase())).size).toBe(list.length);
    for (const c of CONVERSIONS) expect(c.h1).toMatch(/Converter$|Encoder$|Decoder$/);
  });
  it('primary keywords are unique and appear in the title or H1', () => {
    const kws = CONVERSIONS.map((c) => c.primaryKeyword);
    expect(new Set(kws).size).toBe(kws.length);
    for (const c of CONVERSIONS) {
      const target = `${c.title} ${c.h1}`.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
      const kw = c.primaryKeyword.split(' ').filter((w) => w !== 'to');
      for (const w of kw) expect(target, `${c.slug}: “${w}”`).toContain(w);
    }
  });
});

describe('editorial content', () => {
  it('exists for every conversion (and nothing else) and passes the schema', () => {
    expect([...byId.keys()].sort()).toEqual(CONVERSIONS.map((c) => c.slug).sort());
    for (const c of conversions) {
      const r = conversionContentSchema.safeParse(c.data);
      expect(r.success, `${c.id}: ${r.success ? '' : JSON.stringify(r.error.issues)}`).toBe(true);
      expect(
        c.body.match(/^## /gm)?.length ?? 0,
        `${c.id} needs at least one conversion-specific section`,
      ).toBeGreaterThanOrEqual(1);
    }
    for (const g of guides) expect(guideSchema.safeParse(g.data).success, g.id).toBe(true);
  });
  it('guides referenced by conversions exist, and guide tool links are valid', () => {
    const gids = new Set(guides.map((g) => g.id));
    for (const c of CONVERSIONS) expect(gids.has(c.guide), c.slug).toBe(true);
    const slugs = new Set(CONVERSIONS.map((c) => c.slug));
    for (const g of guides)
      for (const t of g.data['tools'] as string[])
        expect(slugs.has(t), `${g.id} → ${t}`).toBe(true);
  });
  it('pages are genuinely different, not templated (intro + body similarity)', () => {
    const texts = conversions.map((c) => ({
      id: c.id,
      sh: shingles(`${c.data['intro']} ${c.body}`),
    }));
    let worst = { a: '', b: '', s: 0 };
    for (let i = 0; i < texts.length; i++)
      for (let j = i + 1; j < texts.length; j++) {
        const s = jaccard(texts[i]!.sh, texts[j]!.sh);
        if (s > worst.s) worst = { a: texts[i]!.id, b: texts[j]!.id, s };
      }
    expect(worst.s, `${worst.a} vs ${worst.b}`).toBeLessThan(0.2);
  });
  it('every page has a substantial amount of unique copy', () => {
    for (const c of conversions) {
      const n = words(
        `${c.data['intro']} ${c.body} ${JSON.stringify(c.data['faq'])} ${JSON.stringify(c.data['limitations'])}`,
      ).length;
      expect(n, c.id).toBeGreaterThanOrEqual(300);
    }
  });
  it('FAQ questions are not copy-pasted across pages', () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const c of conversions)
      for (const f of c.data['faq'] as { q: string }[]) {
        const k = f.q.toLowerCase();
        if (seen.has(k)) dupes.push(`${c.id} & ${seen.get(k)}: ${f.q}`);
        seen.set(k, c.id);
      }
    expect(dupes).toEqual([]);
  });
  it('internal links in Markdown point at real pages', () => {
    const valid = new Set([
      '/',
      ...CONVERSIONS.map((c) => c.path),
      ...guides.map((g) => `/guides/${g.id}/`),
      ...Object.values(CATEGORIES).map((c) => `/${c.path}/`),
    ]);
    for (const e of [...conversions, ...guides])
      for (const m of e.body.matchAll(/\]\((\/[^)#\s]*)\)/g))
        expect(valid.has(m[1]!), `${e.id} → ${m[1]}`).toBe(true);
  });
});
