// Screenshots of key converter states for design review: node scripts/dev/states.mjs <baseURL> <outDir>
import { chromium } from '@playwright/test';
const [base = 'http://localhost:4321', out = '/tmp'] = process.argv.slice(2);
const fx = (f) => `tests/fixtures/input/${f}`;
const browser = await chromium.launch();
const shot = async (name, width, fn, full = false) => {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  await fn(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  await ctx.close();
};
await shot('results-images', 1280, async (p) => {
  await p.goto(`${base}/tiff-to-jpg/`);
  await p.locator('input[type=file]').setInputFiles([fx('multipage.tiff'), fx('sample.tiff')]);
  await p.getByTestId('convert').click();
  await p.getByTestId('results').waitFor();
  await p.getByTestId('results').scrollIntoViewIfNeeded();
});
await shot('ready-pdf', 1280, async (p) => {
  await p.goto(`${base}/jpg-to-pdf/`);
  await p
    .locator('input[type=file]')
    .setInputFiles([fx('sample.jpg'), fx('rotated.jpg'), fx('not-an-image.png')]);
  await p.getByRole('button', { name: /Settings/ }).click();
  await p.getByTestId('converter').scrollIntoViewIfNeeded();
});
await shot('paste-json', 1280, async (p) => {
  await p.goto(`${base}/json-to-yaml/`);
  await p.getByRole('tab', { name: 'Paste text' }).click();
  await p.getByRole('button', { name: 'Try an example' }).click();
  await p.getByTestId('result-text').waitFor();
  await p.getByTestId('converter').scrollIntoViewIfNeeded();
});
await shot('error-mobile', 390, async (p) => {
  await p.goto(`${base}/jpg-to-png/`);
  await p.locator('input[type=file]').setInputFiles(fx('corrupt.jpg'));
  await p.getByTestId('convert').click();
  await p.getByTestId('error').waitFor();
  await p.getByTestId('error').scrollIntoViewIfNeeded();
});
await shot('tool-full', 1280, async (p) => p.goto(`${base}/heic-to-jpg/`), true);
await shot('home-dark', 1280, async (p) => {
  await p.emulateMedia({ colorScheme: 'dark' });
  await p.goto(`${base}/`);
});
await browser.close();
