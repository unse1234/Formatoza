// Generates raster brand assets (icons, favicon.ico, Open Graph image) into
// public/. Run manually after changing the logo: `node scripts/generate-brand-assets.mjs`.
// Uses sharp for icons and headless Chromium (Playwright) for the OG image so
// it is rendered with the real Geist font.
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const icon = (size, pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-pad} ${-pad} ${32 + 2 * pad} ${32 + 2 * pad}">
<rect x="${-pad}" y="${-pad}" width="${32 + 2 * pad}" height="${32 + 2 * pad}" fill="#fafafa"/>
<rect width="32" height="32" rx="7" fill="#171717"/>
<path d="M9.5 9h13M9.5 16h7.5M9.5 9v14" stroke="#fafafa" stroke-width="2.6" stroke-linecap="round" fill="none"/>
<path d="M18.5 12.5 22 16l-3.5 3.5" stroke="#fafafa" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
const bare = (size) => icon(size).replace(/<rect x="[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" fill="#fafafa"\/>\n/, '');

await sharp(Buffer.from(bare(512))).png().toFile('public/icon-512.png');
await sharp(Buffer.from(bare(192))).png().toFile('public/icon-192.png');
await sharp(Buffer.from(icon(180, 3))).png().toFile('public/apple-touch-icon.png');

// favicon.ico with PNG-encoded 16/32/48 entries.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(Buffer.from(bare(s))).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const p = 6 + i * 16;
  header.writeUInt8(s, p);
  header.writeUInt8(s, p + 1);
  header.writeUInt16LE(1, p + 4);
  header.writeUInt16LE(32, p + 6);
  header.writeUInt32LE(pngs[i].length, p + 8);
  header.writeUInt32LE(offset, p + 12);
  offset += pngs[i].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...pngs]));

// Open Graph image.
const font = (f) => `data:font/woff2;base64,${readFileSync(resolve(root, 'node_modules/@fontsource-variable', f)).toString('base64')}`;
const html = `<!doctype html><html><head><style>
@font-face{font-family:G;src:url(${font('geist/files/geist-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:M;src:url(${font('geist-mono/files/geist-mono-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#fafafa;color:#171717;font-family:G;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:600;letter-spacing:-.04em}
h1{font-size:84px;line-height:1;letter-spacing:-.05em;font-weight:600;max-width:960px}
.row{display:flex;gap:14px;flex-wrap:wrap}.c{font-family:M;font-size:26px;font-weight:500;padding:10px 16px;border-radius:10px;background:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.08)}
.foot{display:flex;justify-content:space-between;align-items:center;font-size:26px;color:#4d4d4d}.dot{display:inline-block;width:14px;height:14px;border-radius:99px;background:#45a557;margin-right:12px}
</style></head><body>
<div class="top">${bare(56)}formatoza</div>
<h1>Convert files without uploading them.</h1>
<div class="row"><span class="c">HEIC → JPG</span><span class="c">PDF → PNG</span><span class="c">CSV → JSON</span><span class="c">SRT → VTT</span><span class="c">WebP → PNG</span></div>
<div class="foot"><span><span class="dot"></span>Processed in your browser · free · no sign-up</span></div>
</body></html>`;
mkdirSync('public/og', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og/default.png' });
await browser.close();
console.log('brand assets written to public/');
