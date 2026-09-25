import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const pages = process.argv.slice(2);
for (const [w, h, tag] of [
  [1280, 900, 'd'],
  [390, 844, 'm'],
]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on(
    'console',
    (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text()),
  );
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const p of pages) {
    await page.goto(`http://localhost:4321${p}`, { waitUntil: 'networkidle' });
    const name = (p.replace(/\//g, '_') || 'home') + `-${tag}.png`;
    await page.screenshot({
      path: `${process.env.OUT ?? '/tmp'}/${name}`,
      fullPage: tag === 'd' ? false : false,
    });
  }
  if (errors.length) console.log(tag, errors);
  await ctx.close();
}
await browser.close();
