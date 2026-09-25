/**
 * Privacy-safe product analytics. Only coarse, enumerated facts about a
 * conversion are allowed through — never file names, contents, sizes in
 * bytes, text input or error messages (which can echo file content).
 * With no provider registered (the default), events go nowhere.
 */
import type { EngineId } from '~/lib/catalog/types';
import type { ErrorCode } from '~/engines/types';

export type AnalyticsEvent = 'convert_start' | 'convert_complete' | 'convert_cancel' | 'download' | 'copy';

export interface AnalyticsProps {
  tool?: string;
  engine?: EngineId;
  outcome?: 'success' | 'partial' | 'error' | 'cancelled';
  files?: '1' | '2-5' | '6-20' | '21+';
  size?: '<1MB' | '1-10MB' | '10-50MB' | '50MB+';
  duration?: '<1s' | '1-5s' | '5-30s' | '30s+';
  errorCode?: ErrorCode;
  inputMode?: 'file' | 'paste';
}

const ENUMS: { [K in keyof AnalyticsProps]-?: readonly string[] | RegExp } = {
  tool: /^[a-z0-9]+(-[a-z0-9]+)*$/,
  engine: ['image', 'pdf', 'data', 'text', 'subtitles', 'document'],
  outcome: ['success', 'partial', 'error', 'cancelled'],
  files: ['1', '2-5', '6-20', '21+'],
  size: ['<1MB', '1-10MB', '10-50MB', '50MB+'],
  duration: ['<1s', '1-5s', '5-30s', '30s+'],
  errorCode: ['EMPTY_INPUT', 'UNSUPPORTED_FORMAT', 'FILE_TOO_LARGE', 'TOO_MANY_FILES', 'MALFORMED_INPUT', 'BROWSER_UNSUPPORTED', 'LIMIT_EXCEEDED', 'ENCRYPTED', 'ABORTED', 'INTERNAL'],
  inputMode: ['file', 'paste'],
};

const EVENTS: readonly AnalyticsEvent[] = ['convert_start', 'convert_complete', 'convert_cancel', 'download', 'copy'];

/** Drops every key/value that is not an explicitly allowed enum value. */
export function sanitizeProps(raw: Record<string, unknown>): AnalyticsProps {
  const out: Record<string, string> = {};
  for (const [key, rule] of Object.entries(ENUMS)) {
    const v = raw[key];
    if (typeof v !== 'string' || v.length > 40) continue;
    if (rule instanceof RegExp ? rule.test(v) : rule.includes(v)) out[key] = v;
  }
  return out as AnalyticsProps;
}

export function bucketFiles(n: number): AnalyticsProps['files'] {
  return n <= 1 ? '1' : n <= 5 ? '2-5' : n <= 20 ? '6-20' : '21+';
}
export function bucketSize(bytes: number): AnalyticsProps['size'] {
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? '<1MB' : mb < 10 ? '1-10MB' : mb < 50 ? '10-50MB' : '50MB+';
}
export function bucketDuration(ms: number): AnalyticsProps['duration'] {
  return ms < 1000 ? '<1s' : ms < 5000 ? '1-5s' : ms < 30000 ? '5-30s' : '30s+';
}

export type AnalyticsSink = (event: AnalyticsEvent, props: AnalyticsProps) => void;

declare global {
  interface Window {
    /** A provider may register a sink here; it only ever receives sanitised props. */
    __fzAnalytics?: AnalyticsSink;
  }
}

export function track(event: AnalyticsEvent, props: Record<string, unknown>): void {
  if (!EVENTS.includes(event)) return;
  const clean = sanitizeProps(props);
  try {
    if (typeof window !== 'undefined') window.__fzAnalytics?.(event, clean);
  } catch {
    /* analytics must never break conversions */
  }
}
