/**
 * Lazy engine loader — the only way UI code obtains a converter. Each engine
 * is a separate chunk; heavy libraries inside them are further lazy-loaded.
 */
import type { EngineId } from '~/lib/catalog/types';
import type { ConverterEngine } from './types';

const LOADERS: Record<EngineId, () => Promise<ConverterEngine>> = {
  image: () => import('./image').then((m) => m.imageEngine),
  pdf: () => import('./pdf').then((m) => m.pdfEngine),
  data: () => import('./data').then((m) => m.dataEngine),
  text: () => import('./text').then((m) => m.textEngine),
  subtitles: () => import('./subtitles').then((m) => m.subtitlesEngine),
  document: () => import('./document').then((m) => m.documentEngine),
};

const cache = new Map<EngineId, Promise<ConverterEngine>>();

export function loadEngine(id: EngineId): Promise<ConverterEngine> {
  let p = cache.get(id);
  if (!p) {
    p = LOADERS[id]().catch((err: unknown) => {
      cache.delete(id); // allow retry after a network hiccup
      throw err;
    });
    cache.set(id, p);
  }
  return p;
}

/** Starts downloading an engine early (e.g. when the user hovers the drop zone). */
export function preloadEngine(id: EngineId): void {
  void loadEngine(id).catch(() => undefined);
}
