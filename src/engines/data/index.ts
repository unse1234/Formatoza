/**
 * Browser entry for the data engine: runs conversions in a dedicated Web
 * Worker so large files never freeze the page. Cancelling terminates the
 * worker, which stops work immediately. The parsing libraries live only in
 * the worker chunk (and in the main-thread fallback, loaded on demand).
 */
import { matchesFormat } from '../shared/extensions';
import { validateFiles } from '../shared/engine-utils';
import {
  ConversionError,
  type ConversionIssue,
  type ConversionResult,
  type ConverterEngine,
  type ProgressUpdate,
} from '../types';

type WorkerMessage =
  | { id: number; type: 'progress'; progress: ProgressUpdate }
  | { id: number; type: 'done'; result: ConversionResult }
  | { id: number; type: 'error'; issue: ConversionIssue };

let worker: Worker | undefined;
let nextId = 1;

function getWorker(): Worker {
  worker ??= new Worker(new URL('./data.worker.ts', import.meta.url), {
    type: 'module',
    name: 'formatoza-data',
  });
  return worker;
}

export const dataEngine: ConverterEngine = {
  id: 'data',
  sourceFormats: ['csv', 'tsv', 'json', 'xml', 'yaml'],
  targetFormats: ['csv', 'tsv', 'json', 'xml', 'yaml', 'xlsx'],
  supportsBatch: true,
  runsLocally: true,
  canProcess: (file, from) => matchesFormat(file, from),
  validate: (input, limits) => validateFiles(input, limits),
  async convert(input, options, ctx) {
    if (typeof Worker === 'undefined') {
      const { dataEngineCore } = await import('./core');
      return dataEngineCore.convert(input, options, ctx);
    }
    if (ctx?.signal?.aborted) throw new ConversionError('ABORTED', 'Conversion cancelled.');
    const w = getWorker();
    const id = nextId++;
    return new Promise<ConversionResult>((resolve, reject) => {
      const cleanup = () => {
        w.removeEventListener('message', onMessage);
        w.removeEventListener('error', onError);
        ctx?.signal?.removeEventListener('abort', onAbort);
      };
      const reset = () => {
        worker?.terminate();
        worker = undefined;
      };
      const onMessage = (e: MessageEvent<WorkerMessage>) => {
        if (e.data.id !== id) return;
        if (e.data.type === 'progress') ctx?.onProgress?.(e.data.progress);
        else if (e.data.type === 'done') {
          cleanup();
          resolve(e.data.result);
        } else {
          cleanup();
          reject(
            new ConversionError(
              e.data.issue.code === 'WARNING' ? 'INTERNAL' : e.data.issue.code,
              e.data.issue.message,
            ),
          );
        }
      };
      const onError = (e: ErrorEvent) => {
        cleanup();
        reset();
        reject(
          new ConversionError(
            'INTERNAL',
            e.message ||
              'The conversion worker stopped (the file may be too large for this device).',
          ),
        );
      };
      const onAbort = () => {
        cleanup();
        reset();
        reject(new ConversionError('ABORTED', 'Conversion cancelled.'));
      };
      w.addEventListener('message', onMessage);
      w.addEventListener('error', onError);
      ctx?.signal?.addEventListener('abort', onAbort, { once: true });
      w.postMessage({ id, input, options: options ?? {} });
    });
  },
};
