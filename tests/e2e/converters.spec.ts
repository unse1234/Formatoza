/**
 * End-to-end: every converter page converts a real fixture in Chromium and
 * produces a valid output — with no console errors and no uploads.
 */
import { expect, test } from '@playwright/test';
import {
  CONVERSIONS,
  downloadedOutputs,
  fixturePath,
  magic,
  plan,
  watchConsole,
  watchNetwork,
} from './helpers';

for (const c of CONVERSIONS) {
  test(`${c.slug} converts a real file`, async ({ page, baseURL }) => {
    const problems = watchConsole(page);
    const requests = watchNetwork(page);
    const p = plan(c);
    await page.goto(`/${c.slug}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(c.h1);
    await expect(page.getByTestId('converter')).toBeVisible();

    let files = p.files.map(fixturePath);
    if (c.slug === 'base64-to-json') {
      // Build a Base64 JSON input on the fly.
      const { writeFileSync } = await import('node:fs');
      const path = test.info().outputPath('json.b64.txt');
      writeFileSync(path, Buffer.from('"Hello, wörld! 👋\\n"').toString('base64'));
      files = [path];
    }
    const before = requests.length;
    await page.locator('input[type="file"]').setInputFiles(files);
    await expect(page.getByTestId('file-item')).toHaveCount(files.length);
    await page.getByTestId('convert').click();
    await expect(page.getByTestId('results')).toBeVisible({ timeout: 45_000 });
    await expect(page.getByTestId('error')).toHaveCount(0);

    const outputs = await downloadedOutputs(page);
    expect(outputs, JSON.stringify(outputs.map((o) => o.name))).toHaveLength(p.outputs);
    for (const o of outputs) {
      expect(o.size).toBeGreaterThan(0);
      expect(magic(o.bytes), o.name).toBe(
        p.kind === 'jpg' ||
          p.kind === 'png' ||
          p.kind === 'webp' ||
          p.kind === 'pdf' ||
          p.kind === 'zip'
          ? p.kind
          : 'text',
      );
    }
    if (p.contains) expect(outputs[0]!.text).toContain(p.contains);

    // Privacy: conversion caused no uploads and no third-party requests.
    const origin = new URL(baseURL!).origin;
    const during = requests.slice(before);
    for (const r of during) {
      expect(['GET', 'HEAD'], `${r.method()} ${r.url()}`).toContain(r.method());
      const u = r.url();
      expect(u.startsWith(origin) || u.startsWith('blob:') || u.startsWith('data:'), u).toBe(true);
    }
    expect(problems).toEqual([]);
  });
}
