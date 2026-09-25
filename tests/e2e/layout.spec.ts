import { expect, test } from '@playwright/test';
import { CONVERSIONS, watchConsole } from './helpers';

const PAGES = [
  '/',
  '/image-converters/',
  '/pdf-converters/',
  '/data-converters/',
  '/developer-converters/',
  '/subtitle-converters/',
  '/document-converters/',
  '/guides/',
  '/guides/data-formats-compared/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/cookies/',
  '/how-it-works/',
  '/editorial-policy/',
  ...CONVERSIONS.map((c) => `/${c.slug}/`),
];

for (const path of PAGES) {
  test(`${path} renders without overflow or console errors`, async ({ page }) => {
    const problems = watchConsole(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(1);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(problems).toEqual([]);
  });
}

test('mobile menu opens and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile only');
  await page.goto('/');
  await page.getByLabel('Menu').click();
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeHidden();
});
