// Prints axe violations with element snippets for quick fixing: node scripts/dev/axe-report.mjs /path/ ...
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser = await chromium.launch();
const page = await (
  await browser.newContext({
    colorScheme: process.env.DARK ? 'dark' : 'light',
    ...(process.env.MOBILE
      ? { viewport: { width: 412, height: 839 }, isMobile: true, hasTouch: true }
      : {}),
  })
).newPage();
for (const p of process.argv.slice(2)) {
  await page.goto(`http://localhost:4321${p}`, { waitUntil: 'networkidle' });
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  for (const v of r.violations)
    for (const n of v.nodes)
      console.log(p, v.id, '|', n.html.slice(0, 140), '|', (n.any[0]?.message ?? '').slice(0, 160));
}
await browser.close();
