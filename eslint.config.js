import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'converter-site-kit/',
      'test-results/',
      'playwright-report/',
      'tests/fixtures/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: ['src/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    // Architectural boundary: UI never talks to conversion libraries directly.
    files: ['src/components/**/*.{ts,tsx,astro}', 'src/pages/**/*.{ts,astro}', 'src/layouts/**/*.astro'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'pdfjs-dist*',
                'pdf-lib',
                'heic-to*',
                'utif2',
                'papaparse',
                'fast-xml-parser',
                'js-yaml',
                'marked',
                'turndown*',
                'mammoth*',
                '@jsquash/*',
                'fflate',
              ],
              message: 'UI code must go through src/engines (ConverterEngine) or src/lib, never a conversion library.',
            },
          ],
        },
      ],
    },
  },
);
