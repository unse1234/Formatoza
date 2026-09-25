/**
 * The converter-engine contract. UI code talks only to this interface
 * (via `loadEngine` in ./registry) and never to conversion libraries.
 */
import type { EngineId, FormatId } from '~/lib/catalog/types';
import type { OptionValues } from './options';

export type ErrorCode =
  | 'EMPTY_INPUT'
  | 'UNSUPPORTED_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'TOO_MANY_FILES'
  | 'MALFORMED_INPUT'
  | 'BROWSER_UNSUPPORTED'
  | 'LIMIT_EXCEEDED'
  | 'ENCRYPTED'
  | 'ABORTED'
  | 'INTERNAL';

export interface ConversionIssue {
  code: ErrorCode | 'WARNING';
  message: string;
  /** Display name of the file concerned (never sent anywhere). */
  file?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ConversionIssue[];
  warnings: ConversionIssue[];
}

export interface ConversionInput {
  /** Files to convert. Pasted text is wrapped in a `File` by the UI. */
  files: File[];
  from: FormatId;
  to: FormatId;
}

export interface ConversionLimits {
  maxFiles: number;
  maxFileBytes: number;
}

export interface ProgressUpdate {
  /** 0..1 overall progress. */
  fraction: number;
  label?: string;
}

export interface ConversionContext {
  signal?: AbortSignal;
  onProgress?: (update: ProgressUpdate) => void;
}

export interface OutputFile {
  name: string;
  mimeType: string;
  blob: Blob;
  /** Name of the input it came from (for grouping in the UI). */
  sourceName?: string;
  /** Short facts shown next to the result, e.g. { Size: "4032 × 3024" }. */
  details?: Record<string, string>;
}

export interface ConversionResult {
  outputs: OutputFile[];
  /** Per-file failures; outputs may still be non-empty (partial failure). */
  errors: ConversionIssue[];
  warnings: ConversionIssue[];
}

export interface ConverterEngine {
  id: EngineId;
  sourceFormats: FormatId[];
  targetFormats: FormatId[];
  supportsBatch: boolean;
  /** True when no byte of the input leaves the device. */
  runsLocally: true;
  canProcess(file: File, from: FormatId): boolean;
  validate(input: ConversionInput, limits: ConversionLimits): ValidationResult;
  convert(input: ConversionInput, options?: Partial<OptionValues>, context?: ConversionContext): Promise<ConversionResult>;
}

export class ConversionError extends Error {
  readonly code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
  }
}
