import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { fixturePath } from './helpers';

const PAGES = [
  '/',
  '/heic-to-jpg/',
  '/csv-to-json/',
  '/image-converters/',
  '/guides/',
  '/guides/heic-vs-jpg/',
  '/privacy/',
  '/404/',
  '/id/heic-ke-jpg/',
  '/vi/',
  '/tr/csv-json-donusturme/',
  '/pt/srt-para-vtt/',
];

for (const path of PAGES) {
  test(`no axe violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
  });
}

test('converter results state has no axe violations', async ({ page }) => {
  await page.goto('/png-to-jpg/');
  await page.locator('input[type="file"]').setInputFiles(fixturePath('sample.png'));
  await page.getByTestId('convert').click();
  await expect(page.getByTestId('results')).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
});

test('keyboard: skip link, search shortcut and converter controls', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop keyboard flow');
  await page.goto('/heic-to-jpg/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();

  await page.keyboard.press('/');
  const search = page.locator('#header-search-input');
  await expect(search).toBeFocused();
  await page.keyboard.type('webp png');
  await expect(page.getByRole('option').first()).toContainText('WebP to PNG');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/webp-to-png\/$/);

  // Reach the file button and the settings toggle with Tab only.
  const chooser = page.getByTestId('file-input');
  for (let i = 0; i < 40 && !(await chooser.evaluate((el) => el === document.activeElement)); i++)
    await page.keyboard.press('Tab');
  await expect(chooser).toBeFocused();
  const settings = page.getByRole('button', { name: /Settings/ });
  for (let i = 0; i < 10 && !(await settings.evaluate((el) => el === document.activeElement)); i++)
    await page.keyboard.press('Tab');
  await expect(settings).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(settings).toHaveAttribute('aria-expanded', 'true');
});

test('focus moves to results after converting', async ({ page }) => {
  await page.goto('/png-to-jpg/');
  await page.locator('input[type="file"]').setInputFiles(fixturePath('sample.png'));
  await page.getByTestId('convert').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('results')).toBeFocused();
});

test.describe('dark mode', () => {
  test.use({ colorScheme: 'dark' });
  for (const path of ['/', '/heic-to-jpg/', '/guides/heic-vs-jpg/', '/tr/heic-jpg-cevirme/']) {
    test(`no axe violations on ${path} (dark)`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
    });
  }
});
