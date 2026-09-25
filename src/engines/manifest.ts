/**
 * Lightweight description of what each engine can do. Importing this file must
 * never pull in a conversion library — it is used at build time by the catalog
 * and on the client before the (lazy) engine chunk is loaded.
 */
import type { EngineId, FormatId } from '~/lib/catalog/types';

const IMAGE_INPUTS: FormatId[] = ['heic', 'avif', 'webp', 'jpg', 'png', 'svg', 'gif', 'bmp', 'tiff', 'ico'];
const IMAGE_OUTPUTS: FormatId[] = ['jpg', 'png', 'webp'];
const DATA_FORMATS: FormatId[] = ['csv', 'tsv', 'json', 'xml', 'yaml'];
const SUBTITLE_INPUTS: FormatId[] = ['srt', 'vtt', 'ass'];

type Pair = readonly [FormatId, FormatId];

function cross(from: FormatId[], to: FormatId[]): Pair[] {
  return from.flatMap((f) => to.filter((t) => t !== f).map((t) => [f, t] as const));
}

export const ENGINE_PAIRS: Record<EngineId, Pair[]> = {
  image: cross(IMAGE_INPUTS, IMAGE_OUTPUTS),
  pdf: [
    ...cross(['jpg', 'png', 'webp', 'heic'], ['pdf']),
    ...cross(['pdf'], ['jpg', 'png', 'webp', 'txt']),
  ],
  data: [...cross(DATA_FORMATS, DATA_FORMATS), ...cross(['csv', 'tsv', 'json'], ['xlsx'])],
  text: [
    ['markdown', 'html'],
    ['html', 'markdown'],
    ['html', 'txt'],
    ['markdown', 'txt'],
    ['txt', 'base64'],
    ['base64', 'txt'],
    ['json', 'base64'],
    ['base64', 'json'],
    ['txt', 'urlencoded'],
    ['urlencoded', 'txt'],
  ],
  subtitles: cross(SUBTITLE_INPUTS, ['srt', 'vtt', 'ass', 'txt']),
  document: cross(['docx'], ['html', 'txt']),
};

export function engineSupports(engine: EngineId, from: FormatId, to: FormatId): boolean {
  return ENGINE_PAIRS[engine].some(([f, t]) => f === from && t === to);
}
