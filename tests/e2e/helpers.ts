import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page, Request } from '@playwright/test';

export interface CatalogEntry {
  slug: string;
  from: string;
  to: string;
  engine: string;
  category: string;
  h1: string;
  title: string;
}

export const ROOT = process.cwd();
export const CONVERSIONS: CatalogEntry[] = JSON.parse(
  readFileSync(join(ROOT, 'src', 'data', 'conversions.json'), 'utf8'),
);
export const FIXTURE_DIR = join(ROOT, 'tests', 'fixtures', 'input');
export const fixturePath = (name: string) => join(FIXTURE_DIR, name);

/** Collects console errors/warnings and uncaught exceptions. */
export function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

/** Records every network request so tests can prove nothing is uploaded. */
export function watchNetwork(page: Page): Request[] {
  const requests: Request[] = [];
  page.on('request', (r) => requests.push(r));
  return requests;
}

/** Reads the bytes behind each result's download link (blob: URLs) inside the page. */
export async function downloadedOutputs(
  page: Page,
): Promise<{ name: string; bytes: number[]; text: string; size: number }[]> {
  return page.$$eval('[data-testid="download"]', async (links) =>
    Promise.all(
      (links as HTMLAnchorElement[]).map(async (a) => {
        const buf = new Uint8Array(await (await fetch(a.href)).arrayBuffer());
        return {
          name: a.download,
          bytes: Array.from(buf.slice(0, 16)),
          text: new TextDecoder().decode(buf.slice(0, 200_000)),
          size: buf.length,
        };
      }),
    ),
  );
}

export function magic(bytes: number[]): string {
  const s = String.fromCharCode(...bytes);
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpg';
  if (bytes[0] === 0x89 && s.slice(1, 4) === 'PNG') return 'png';
  if (s.startsWith('RIFF') && s.slice(8, 12) === 'WEBP') return 'webp';
  if (s.startsWith('%PDF')) return 'pdf';
  if (s.startsWith('PK')) return 'zip';
  return 'text';
}
