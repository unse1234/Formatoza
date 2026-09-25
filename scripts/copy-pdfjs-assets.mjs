// Copies PDF.js runtime data (CMaps, standard fonts, WASM image decoders, ICC
// profiles) into public/vendor/pdfjs so they are served as static files and
// fetched by PDF.js only when a PDF actually needs them.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkgDir = dirname(require.resolve('pdfjs-dist/package.json'));
const version = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).version;
const dest = join(process.cwd(), 'public', 'vendor', 'pdfjs');
const stamp = join(dest, '.version');

if (existsSync(stamp) && readFileSync(stamp, 'utf8') === version) {
  console.log(`[pdfjs-assets] up to date (${version})`);
  process.exit(0);
}
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
for (const dir of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) cpSync(join(pkgDir, dir), join(dest, dir), { recursive: true });
writeFileSync(stamp, version);
console.log(`[pdfjs-assets] copied PDF.js ${version} data to public/vendor/pdfjs`);
