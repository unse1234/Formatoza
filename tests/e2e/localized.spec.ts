/**
 * Localized pages: every localized tool converts a real file with the page-language UI,
 * errors are explained in the page language, and the language switcher is keyboard usable.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { expect, test } from '@playwright/test';
import {
  CONVERSIONS,
  ROOT,
  downloadedOutputs,
  fixturePath,
  magic,
  plan,
  watchConsole,
  watchNetwork,
} from './helpers';

interface LocalizedEntry {
  locale: string;
  conversion: string;
  slug: string;
  h1: string;
}

const LOCALIZED: LocalizedEntry[] = Object.entries(
  JSON.parse(readFileSync(join(ROOT, 'src/data/localized-pages.json'), 'utf8')) as Record<
    string,
    { conversion: string; slug: string }[]
  >,
).flatMap(([locale, entries]) =>
  entries.map((e) => {
    const md = readFileSync(join(ROOT, 'src/content/localized', locale, `${e.slug}.md`), 'utf8');
    const fm = load(md.split(/^---$/m)[1]!) as { h1: string };
    return { locale, ...e, h1: fm.h1 };
  }),
);

/** Text that proves the island rendered in the page language (not English). */
const CONVERTING_READY: Record<string, RegExp> = {
  id: /siap$/,
  vi: /^Đã xong/,
  tr: /hazır$/,
  pt: /pronto\(s\)$/,
};

for (const lp of LOCALIZED) {
  const c = CONVERSIONS.find((x) => x.slug === lp.conversion)!;
  test(`/${lp.locale}/${lp.slug}/ converts a real file in ${lp.locale}`, async ({
    page,
    baseURL,
  }) => {
    const problems = watchConsole(page);
    const requests = watchNetwork(page);
    const p = plan(c);
    await page.goto(`/${lp.locale}/${lp.slug}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', lp.locale);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(lp.h1);
    await expect(page.getByTestId('dropzone')).not.toContainText('Choose file');

    const before = requests.length;
    await page.locator('input[type="file"]').setInputFiles(p.files.map(fixturePath));
    await expect(page.getByTestId('file-item')).toHaveCount(p.files.length);
    const convert = page.getByTestId('convert');
    await expect(convert).not.toHaveText(/^(Convert|Combine) /);
    await convert.click();
    const results = page.getByTestId('results');
    await expect(results).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('error')).toHaveCount(0);
    if (p.outputs === 1)
      await expect(results.locator('h2')).toHaveText(CONVERTING_READY[lp.locale]!);
    await expect(page.getByTestId('download').first()).not.toHaveText('Download');

    const outputs = await downloadedOutputs(page);
    expect(outputs).toHaveLength(p.outputs);
    for (const o of outputs) {
      expect(o.size).toBeGreaterThan(0);
      expect(magic(o.bytes)).toBe(
        ['jpg', 'png', 'webp', 'pdf', 'zip'].includes(p.kind) ? p.kind : 'text',
      );
    }
    if (p.contains) expect(outputs[0]!.text).toContain(p.contains);

    const origin = new URL(baseURL!).origin;
    for (const r of requests.slice(before)) {
      expect(['GET', 'HEAD']).toContain(r.method());
      const u = r.url();
      expect(u.startsWith(origin) || u.startsWith('blob:') || u.startsWith('data:'), u).toBe(true);
    }
    expect(problems).toEqual([]);
  });
}

test('wrong file type is explained in the page language', async ({ page }) => {
  await page.goto('/id/heic-ke-jpg/');
  await page.locator('input[type="file"]').setInputFiles(fixturePath('not-an-image.png'));
  const item = page.getByTestId('file-item');
  await expect(item).toContainText('File ini sepertinya bukan file HEIC.');
  await expect(item).not.toContainText("doesn't look like");
  await expect(page.getByTestId('convert')).toBeDisabled();
});

test('malformed input: localized error with the English detail marked as English', async ({
  page,
}) => {
  await page.goto('/pt/json-para-csv/');
  await page.locator('input[type="file"]').setInputFiles(fixturePath('malformed.json'));
  await page.getByTestId('convert').click();
  const error = page.getByTestId('error');
  await expect(error).toContainText('Não foi possível converter este arquivo');
  await expect(error).toContainText('Não foi possível ler este arquivo como JSON válido.');
  await expect(error.locator('[lang="en"]')).toHaveCount(1);
});

test('file too large is explained in the page language', async ({ page }) => {
  await page.goto('/tr/srt-vtt-cevirme/');
  // 10 MB is the subtitle limit; an 11 MB file is refused before conversion.
  await page.locator('input[type="file"]').setInputFiles({
    name: 'buyuk.srt',
    mimeType: 'application/x-subrip',
    buffer: Buffer.alloc(11 * 1024 * 1024, 'a'),
  });
  await expect(page.getByTestId('file-item')).toContainText('sınırını aşıyor');
});

test('cancel and paste mode speak the page language', async ({ page }) => {
  await page.goto('/vi/srt-sang-vtt/');
  await page.getByRole('tab', { name: 'Dán văn bản' }).click();
  await page.getByTestId('text-input').fill('1\n00:00:01,000 --> 00:00:02,000\nXin chào\n');
  await expect(page.getByTestId('result-text')).toContainText('WEBVTT');
  await expect(page.getByTestId('result-text')).toContainText('Xin chào');
  await expect(page.getByRole('button', { name: 'Sao chép' })).toBeVisible();
});

test('language switcher: keyboard, hreflang links, Escape', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop keyboard flow');
  await page.goto('/tr/heic-jpg-cevirme/');
  const switcher = page.locator('[data-lang-menu] summary');
  await expect(switcher).toHaveAccessibleName('Dil: Türkçe');
  await switcher.focus();
  await page.keyboard.press('Enter');
  const menu = page.locator('[data-lang-menu]');
  await expect(menu).toHaveAttribute('open', '');
  const links = menu.getByRole('link');
  await expect(links).toHaveCount(4); // en, id, vi, tr — only languages that have this page
  await expect(menu.getByRole('link', { name: 'Türkçe' })).toHaveAttribute('aria-current', 'page');
  await expect(menu.getByRole('link', { name: 'English' })).toHaveAttribute('hreflang', 'en');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(switcher).toBeFocused();

  await switcher.click();
  await menu.getByRole('link', { name: 'Bahasa Indonesia' }).click();
  await expect(page).toHaveURL(/\/id\/heic-ke-jpg\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'id');
});

test('English page offers its localized versions, English-only pages do not', async ({ page }) => {
  await page.goto('/srt-to-vtt/');
  await page.locator('[data-lang-menu] summary').click();
  await expect(page.locator('[data-lang-menu]').getByRole('link')).toHaveCount(5);
  await page.goto('/png-to-jpg/');
  await expect(page.locator('[data-lang-menu]')).toHaveCount(0);
});

test('hub lists every localized tool of its language', async ({ page }) => {
  for (const locale of [...new Set(LOCALIZED.map((l) => l.locale))]) {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    for (const lp of LOCALIZED.filter((l) => l.locale === locale))
      await expect(page.locator(`main a[href="/${locale}/${lp.slug}/"]`).first()).toBeVisible();
  }
});
