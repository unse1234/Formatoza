import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ConversionResult } from '~/engines/types';

export const FIXTURES = join(__dirname, '..', 'fixtures', 'input');

export function fixture(name: string, as?: string): File {
  return new File([readFileSync(join(FIXTURES, name))], as ?? name);
}

export function textFile(text: string, name: string): File {
  return new File([text], name);
}

export async function outputText(r: ConversionResult, i = 0): Promise<string> {
  const o = r.outputs[i];
  if (!o) throw new Error(`no output #${i}; errors: ${JSON.stringify(r.errors)}`);
  return o.blob.text();
}

export function abortedSignal(): AbortSignal {
  const c = new AbortController();
  c.abort();
  return c.signal;
}

export const golden = (name: string) => join(__dirname, '..', 'fixtures', 'golden', name);
