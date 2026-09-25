import { formatBytes } from '~/lib/file/format';
import {
  ConversionError,
  type ConversionContext,
  type ConversionInput,
  type ConversionIssue,
  type ConversionLimits,
  type ConversionResult,
  type OutputFile,
  type ValidationResult,
} from '../types';
import { matchesFormat } from './extensions';

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new ConversionError('ABORTED', 'Conversion cancelled.');
}

/** Yields to the event loop so progress renders and cancellation is noticed. */
export function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function validateFiles(input: ConversionInput, limits: ConversionLimits): ValidationResult {
  const errors: ConversionIssue[] = [];
  const warnings: ConversionIssue[] = [];
  if (input.files.length === 0)
    errors.push({ code: 'EMPTY_INPUT', message: 'Add at least one file.' });
  if (input.files.length > limits.maxFiles)
    errors.push({
      code: 'TOO_MANY_FILES',
      message: `You can convert up to ${limits.maxFiles} files at once; ${input.files.length} were added.`,
    });
  for (const f of input.files) {
    if (f.size === 0)
      errors.push({ code: 'EMPTY_INPUT', message: 'This file is empty.', file: f.name });
    else if (f.size > limits.maxFileBytes)
      errors.push({
        code: 'FILE_TOO_LARGE',
        message: `This file is ${formatBytes(f.size)}; the limit for this tool is ${formatBytes(limits.maxFileBytes)} so your browser doesn't run out of memory.`,
        file: f.name,
      });
    else if (!matchesFormat(f, input.from))
      errors.push({
        code: 'UNSUPPORTED_FORMAT',
        message: `This doesn't look like a ${input.from.toUpperCase()} file.`,
        file: f.name,
      });
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function toIssue(err: unknown, file?: string): ConversionIssue {
  if (err instanceof ConversionError)
    return { code: err.code, message: err.message, ...(file ? { file } : {}) };
  const message =
    err instanceof Error && err.message ? err.message : 'Unexpected error while converting.';
  return { code: 'INTERNAL', message, ...(file ? { file } : {}) };
}

/**
 * Converts files one by one. A failing file becomes an issue instead of
 * failing the batch (partial success). Cancellation aborts the whole batch.
 */
export async function runPerFile(
  files: File[],
  context: ConversionContext | undefined,
  convertOne: (
    file: File,
    index: number,
    report: (fraction: number) => void,
  ) => Promise<{ outputs: OutputFile[]; warnings?: ConversionIssue[] }>,
): Promise<ConversionResult> {
  const result: ConversionResult = { outputs: [], errors: [], warnings: [] };
  const total = files.length;
  for (let i = 0; i < total; i++) {
    const file = files[i]!;
    throwIfAborted(context?.signal);
    const report = (fraction: number) =>
      context?.onProgress?.({
        fraction: (i + Math.min(1, Math.max(0, fraction))) / total,
        ...(total > 1 ? { label: `File ${i + 1} of ${total}` } : {}),
      });
    report(0);
    try {
      const r = await convertOne(file, i, report);
      result.outputs.push(...r.outputs);
      if (r.warnings)
        result.warnings.push(...r.warnings.map((w) => ({ ...w, file: w.file ?? file.name })));
    } catch (err) {
      if (err instanceof ConversionError && err.code === 'ABORTED') throw err;
      if (context?.signal?.aborted) throw new ConversionError('ABORTED', 'Conversion cancelled.');
      result.errors.push(toIssue(err, file.name));
    }
    report(1);
    await tick();
  }
  return result;
}

export function warning(message: string, file?: string): ConversionIssue {
  return { code: 'WARNING', message, ...(file ? { file } : {}) };
}
