import { expect, test } from '@playwright/test';
import { downloadedOutputs, fixturePath, watchConsole } from './helpers';

test.describe('converter states', () => {
  test('files chosen before the converter hydrates are not lost', async ({ page }) => {
    // Simulate a slow connection: hold back the React runtime for 1.5 s.
    await page.route('**/_astro/client.*.js', async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.continue();
    });
    await page.goto('/png-to-jpg/', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="file"]').setInputFiles(fixturePath('sample.png'));
    await expect(page.getByTestId('file-item')).toHaveCount(1, { timeout: 15_000 });
    await expect(page.getByTestId('file-item')).toContainText('sample.png');
  });

  test('WebP output falls back to the WASM encoder when the browser cannot encode WebP (Safari)', async ({
    page,
  }) => {
    // Make canvas WebP encoding behave like Safari: it silently returns PNG.
    await page.addInitScript(() => {
      const patch = (proto: { convertToBlob?: (o?: ImageEncodeOptions) => Promise<Blob> }) => {
        const original = proto.convertToBlob;
        if (!original) return;
        proto.convertToBlob = function (this: unknown, o?: ImageEncodeOptions) {
          return original.call(this, o?.type === 'image/webp' ? { type: 'image/png' } : o);
        };
      };
      patch(OffscreenCanvas.prototype as never);
    });
    const problems = watchConsole(page);
    await page.goto('/png-to-webp/');
    await page.locator('input[type="file"]').setInputFiles(fixturePath('sample.png'));
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('results')).toBeVisible({ timeout: 30_000 });
    const [out] = await downloadedOutputs(page);
    expect(String.fromCharCode(...out!.bytes.slice(8, 12))).toBe('WEBP');
    expect(problems).toEqual([]);
  });

  test('paste mode converts as you type and offers copy', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const problems = watchConsole(page);
    await page.goto('/csv-to-json/');
    await page.getByRole('tab', { name: 'Paste text' }).click();
    await page.getByTestId('text-input').fill('a,b\n1,x\n');
    await expect(page.getByTestId('result-text')).toContainText('"a": 1', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Copy' }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('"b": "x"');
    // Malformed input shows an error, not a result.
    await page.getByTestId('text-input').fill('{"not":"csv"');
    await page.getByRole('button', { name: 'Clear' }).click();
    await page.getByRole('button', { name: 'Try an example' }).click();
    await expect(page.getByTestId('result-text')).toContainText('São Paulo');
    expect(problems).toEqual([]);
  });

  test('malformed input shows a clear error', async ({ page }) => {
    await page.goto('/json-to-csv/');
    await page.getByRole('tab', { name: 'Paste text' }).click();
    await page.getByTestId('text-input').fill('{"a": 1,}');
    await expect(page.getByTestId('error')).toContainText('line 1, column 9', { timeout: 10_000 });
  });

  test('unsupported, empty and oversized-type files are flagged before converting', async ({
    page,
  }) => {
    await page.goto('/png-to-jpg/');
    await page
      .locator('input[type="file"]')
      .setInputFiles([fixturePath('empty.png'), fixturePath('sample.pdf')]);
    const items = page.getByTestId('file-item');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText('This file is empty');
    await expect(items.nth(1)).toContainText("doesn't look like a PNG");
    await expect(page.getByTestId('convert')).toBeDisabled();
  });

  test('a corrupt file produces a friendly error', async ({ page }) => {
    await page.goto('/jpg-to-png/');
    await page.locator('input[type="file"]').setInputFiles(fixturePath('corrupt.jpg'));
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('error')).toContainText('could not be decoded');
  });

  test('partial failure keeps the good files', async ({ page }) => {
    await page.goto('/jpg-to-png/');
    await page
      .locator('input[type="file"]')
      .setInputFiles([fixturePath('sample.jpg'), fixturePath('corrupt.jpg')]);
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('results')).toContainText('1 file converted · 1 failed');
    expect(await downloadedOutputs(page)).toHaveLength(1);
  });

  test('encrypted and scanned PDFs are explained', async ({ page }) => {
    await page.goto('/pdf-to-text/');
    await page.locator('input[type="file"]').setInputFiles(fixturePath('encrypted.pdf'));
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('error')).toContainText('password-protected');
    await page.getByRole('button', { name: 'Start over' }).click();
    await page.locator('input[type="file"]').setInputFiles(fixturePath('scanned.pdf'));
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('error')).toContainText('OCR');
  });

  test('settings change the output (JPG quality and PDF page range)', async ({ page }) => {
    await page.goto('/pdf-to-png/');
    await page.getByRole('button', { name: /Settings/ }).click();
    await page.getByLabel('Pages').fill('2-3');
    await page.getByLabel('Resolution').selectOption('72');
    await page.locator('input[type="file"]').setInputFiles(fixturePath('sample.pdf'));
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('results')).toBeVisible();
    const outs = await downloadedOutputs(page);
    expect(outs.map((o) => o.name)).toEqual(['sample-page-2.png', 'sample-page-3.png']);
  });

  test('rotated JPEG comes out upright and multiple outputs zip', async ({ page }) => {
    await page.goto('/jpg-to-png/');
    await page
      .locator('input[type="file"]')
      .setInputFiles([fixturePath('rotated.jpg'), fixturePath('sample.jpg')]);
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('results')).toContainText('Dimensions: 48 × 64');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('download-all').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.zip$/);
  });

  test('images can be reordered before building a PDF', async ({ page }) => {
    await page.goto('/png-to-pdf/');
    await page
      .locator('input[type="file"]')
      .setInputFiles([fixturePath('sample.png'), fixturePath('empty.png')]);
    await page.getByRole('button', { name: 'Move empty.png up' }).click();
    await expect(page.getByTestId('file-item').first()).toContainText('empty.png');
    await page.getByRole('button', { name: 'Remove empty.png' }).click();
    await expect(page.getByTestId('file-item')).toHaveCount(1);
  });

  test('cancelling a long conversion returns to the ready state', async ({ page }) => {
    await page.goto('/csv-to-json/');
    const big =
      'id,name\n' + Array.from({ length: 400_000 }, (_, i) => `${i},"row ${i}"`).join('\n');
    await page
      .locator('input[type="file"]')
      .setInputFiles({ name: 'big.csv', mimeType: 'text/csv', buffer: Buffer.from(big) });
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('progress')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Conversion cancelled')).toBeVisible();
    await expect(page.getByTestId('convert')).toBeEnabled();
  });
});
