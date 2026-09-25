/// <reference lib="webworker" />
import { dataEngineCore } from './core';
import type { ConversionInput } from '../types';
import type { OptionValues } from '../options';
import { toIssue } from '../shared/engine-utils';

interface Request {
  id: number;
  input: ConversionInput;
  options: Partial<OptionValues>;
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const { id, input, options } = event.data;
  try {
    const result = await dataEngineCore.convert(input, options, {
      onProgress: (p) => self.postMessage({ id, type: 'progress', progress: p }),
    });
    self.postMessage({ id, type: 'done', result });
  } catch (err) {
    self.postMessage({ id, type: 'error', issue: toIssue(err) });
  }
};
