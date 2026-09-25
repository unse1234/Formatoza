import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['tests/conversion/**/*.test.ts', 'tests/seo/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20000,
  },
});
