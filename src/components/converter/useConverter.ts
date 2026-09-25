/**
 * Converter state machine: idle → ready → converting → done.
 * Talks to engines only through `loadEngine` and the ConverterEngine contract.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ClientConversion } from '~/lib/catalog/types';
import { loadEngine } from '~/engines/registry';
import { defaultOptionValues, getOptionFields, type OptionField, type OptionValues } from '~/engines/options';
import { validateFiles } from '~/engines/shared/engine-utils';
import { ConversionError, type ConversionIssue, type ConversionResult, type ConverterEngine, type ProgressUpdate } from '~/engines/types';
import { OUTPUT_TYPE, FORMAT_EXTENSIONS } from '~/engines/shared/extensions';
import { bucketDuration, bucketFiles, bucketSize, track } from '~/lib/analytics';
import { checkCapabilities, type Capability } from '~/lib/file/capabilities';

export type Phase = 'idle' | 'ready' | 'converting' | 'done';
export type InputMode = 'file' | 'paste';

export interface Item {
  id: string;
  file: File;
  issue?: ConversionIssue | undefined;
}

interface State {
  phase: Phase;
  mode: InputMode;
  items: Item[];
  text: string;
  options: OptionValues;
  /** Options used for the current result (to detect "settings changed"). */
  resultOptions: string | null;
  progress: ProgressUpdate | null;
  result: ConversionResult | null;
  fatal: ConversionIssue | null;
  notice: string | null;
  capability: Capability | null;
  engine: 'idle' | 'loading' | 'ready' | 'error';
}

type Action =
  | { type: 'add'; items: Item[]; notice: string | null; replace: boolean }
  | { type: 'remove'; id: string }
  | { type: 'move'; id: string; delta: number }
  | { type: 'clear' }
  | { type: 'mode'; mode: InputMode }
  | { type: 'text'; text: string }
  | { type: 'option'; key: string; value: OptionValues[string] }
  | { type: 'start' }
  | { type: 'progress'; progress: ProgressUpdate }
  | { type: 'done'; result: ConversionResult; options: string }
  | { type: 'fatal'; issue: ConversionIssue }
  | { type: 'cancelled' }
  | { type: 'capability'; capability: Capability }
  | { type: 'engine'; status: State['engine'] }
  | { type: 'dismissNotice' };

function phaseFor(items: Item[], text: string, mode: InputMode): Phase {
  return (mode === 'file' ? items.length > 0 : text.length > 0) ? 'ready' : 'idle';
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'add': {
      const items = a.replace ? a.items : [...s.items, ...a.items];
      return { ...s, items, mode: 'file', phase: phaseFor(items, s.text, 'file'), result: null, fatal: null, notice: a.notice, resultOptions: null };
    }
    case 'remove': {
      const items = s.items.filter((i) => i.id !== a.id);
      return { ...s, items, phase: s.phase === 'converting' ? s.phase : phaseFor(items, s.text, s.mode), result: s.phase === 'done' ? s.result : null, notice: null };
    }
    case 'move': {
      const i = s.items.findIndex((x) => x.id === a.id);
      const j = i + a.delta;
      if (i < 0 || j < 0 || j >= s.items.length) return s;
      const items = [...s.items];
      [items[i], items[j]] = [items[j]!, items[i]!];
      return { ...s, items, phase: s.phase === 'done' ? 'ready' : s.phase, result: s.phase === 'done' ? null : s.result };
    }
    case 'clear':
      return { ...s, items: [], text: '', phase: 'idle', result: null, fatal: null, notice: null, progress: null, resultOptions: null };
    case 'mode':
      return { ...s, mode: a.mode, phase: phaseFor(s.items, s.text, a.mode), result: null, fatal: null, notice: null, resultOptions: null };
    case 'text':
      return { ...s, text: a.text, phase: s.phase === 'converting' ? s.phase : a.text ? (s.phase === 'done' ? 'done' : 'ready') : 'idle', fatal: null };
    case 'option':
      return { ...s, options: { ...s.options, [a.key]: a.value } };
    case 'start':
      return { ...s, phase: 'converting', progress: { fraction: 0 }, fatal: null, notice: null };
    case 'progress':
      return s.phase === 'converting' ? { ...s, progress: a.progress } : s;
    case 'done':
      return { ...s, phase: 'done', progress: null, result: a.result, resultOptions: a.options };
    case 'fatal':
      return { ...s, phase: phaseFor(s.items, s.text, s.mode), progress: null, result: null, fatal: a.issue };
    case 'cancelled':
      return { ...s, phase: phaseFor(s.items, s.text, s.mode), progress: null, notice: 'Conversion cancelled. Nothing was saved.' };
    case 'capability':
      return { ...s, capability: a.capability };
    case 'engine':
      return { ...s, engine: a.status };
    case 'dismissNotice':
      return { ...s, notice: null };
  }
}

let counter = 0;
const uid = () => `f${Date.now().toString(36)}${(counter++).toString(36)}`;

const AUTO_CONVERT_MAX_CHARS = 200_000;

export function useConverter(conversion: ClientConversion) {
  const fields: OptionField[] = useMemo(() => getOptionFields(conversion.engine, conversion.from, conversion.to), [conversion]);
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    phase: 'idle',
    mode: 'file',
    items: [],
    text: '',
    options: defaultOptionValues(fields),
    resultOptions: null,
    progress: null,
    result: null,
    fatal: null,
    notice: null,
    capability: null,
    engine: 'idle',
  }));
  const engineRef = useRef<ConverterEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let alive = true;
    void checkCapabilities(conversion).then((c) => alive && dispatch({ type: 'capability', capability: c }));
    return () => {
      alive = false;
      abortRef.current?.abort();
    };
  }, [conversion]);

  const ensureEngine = useCallback(async (): Promise<ConverterEngine> => {
    if (engineRef.current) return engineRef.current;
    dispatch({ type: 'engine', status: 'loading' });
    try {
      const e = await loadEngine(conversion.engine);
      engineRef.current = e;
      dispatch({ type: 'engine', status: 'ready' });
      return e;
    } catch {
      dispatch({ type: 'engine', status: 'error' });
      throw new ConversionError('INTERNAL', 'The converter could not be loaded. Check your connection and try again.');
    }
  }, [conversion.engine]);

  const preload = useCallback(() => {
    void ensureEngine().catch(() => undefined);
  }, [ensureEngine]);

  const limits = useMemo(() => ({ maxFiles: conversion.input.maxFiles, maxFileBytes: conversion.input.maxFileBytes }), [conversion]);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list);
      if (!incoming.length) return;
      const s = stateRef.current;
      if (s.phase === 'converting') return;
      const replace = !conversion.input.multiple || s.phase === 'done';
      const existing = replace ? [] : s.items;
      const seen = new Set(existing.map((i) => `${i.file.name}|${i.file.size}|${i.file.lastModified}`));
      const fresh = incoming.filter((f) => !seen.has(`${f.name}|${f.size}|${f.lastModified}`));
      const room = Math.max(0, conversion.input.maxFiles - existing.length);
      const accepted = conversion.input.multiple ? fresh.slice(0, room) : fresh.slice(0, 1);
      let notice: string | null = null;
      if (fresh.length > accepted.length)
        notice = conversion.input.multiple
          ? `Only ${conversion.input.maxFiles} files can be converted at once; ${fresh.length - accepted.length} were not added.`
          : 'This tool converts one file at a time; only the first file was added.';
      else if (fresh.length < incoming.length) notice = 'Duplicate files were skipped.';
      const items: Item[] = accepted.map((file) => {
        const v = validateFiles({ files: [file], from: conversion.from, to: conversion.to }, { ...limits, maxFiles: 1 });
        return { id: uid(), file, issue: v.errors[0] };
      });
      dispatch({ type: 'add', items, notice, replace });
      preload();
    },
    [conversion, limits, preload],
  );

  const inputFiles = useCallback((): File[] => {
    const s = stateRef.current;
    if (s.mode === 'paste') {
      const ext = FORMAT_EXTENSIONS[conversion.from].ext[0] ?? '.txt';
      return s.text ? [new File([s.text], `converted${ext}`, { type: 'text/plain' })] : [];
    }
    return s.items.filter((i) => !i.issue).map((i) => i.file);
  }, [conversion.from]);

  const convert = useCallback(async () => {
    const s = stateRef.current;
    if (s.phase === 'converting') return;
    const files = inputFiles();
    if (!files.length) {
      dispatch({ type: 'fatal', issue: { code: 'EMPTY_INPUT', message: s.mode === 'paste' ? 'Paste some text first.' : 'Add at least one valid file first.' } });
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    const optionsKey = JSON.stringify(s.options);
    const t0 = performance.now();
    const totalSize = files.reduce((n, f) => n + f.size, 0);
    const baseProps = { tool: conversion.slug, engine: conversion.engine, files: bucketFiles(files.length), size: bucketSize(totalSize), inputMode: s.mode };
    dispatch({ type: 'start' });
    track('convert_start', baseProps);
    try {
      const engine = await ensureEngine();
      const input = { files, from: conversion.from, to: conversion.to };
      const v = engine.validate(input, limits);
      if (!v.ok) throw new ConversionError(v.errors[0]!.code === 'WARNING' ? 'INTERNAL' : v.errors[0]!.code, v.errors[0]!.message);
      const result = await engine.convert(input, s.options, {
        signal: controller.signal,
        onProgress: (p) => dispatch({ type: 'progress', progress: p }),
      });
      if (controller.signal.aborted) throw new ConversionError('ABORTED', 'Conversion cancelled.');
      const outcome = result.outputs.length === 0 ? 'error' : result.errors.length ? 'partial' : 'success';
      track('convert_complete', { ...baseProps, outcome, duration: bucketDuration(performance.now() - t0), errorCode: result.errors[0]?.code });
      if (result.outputs.length === 0 && result.errors.length === 1 && files.length === 1) {
        dispatch({ type: 'fatal', issue: result.errors[0]! });
        return;
      }
      dispatch({ type: 'done', result, options: optionsKey });
    } catch (err) {
      const e = err instanceof ConversionError ? err : new ConversionError('INTERNAL', err instanceof Error ? err.message : 'Unexpected error.');
      if (e.code === 'ABORTED') {
        track('convert_cancel', { ...baseProps, outcome: 'cancelled' });
        dispatch({ type: 'cancelled' });
      } else {
        track('convert_complete', { ...baseProps, outcome: 'error', errorCode: e.code });
        dispatch({ type: 'fatal', issue: { code: e.code, message: e.message } });
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [conversion, ensureEngine, inputFiles, limits]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  // Paste mode: convert as you type (debounced) for reasonably small inputs.
  const autoConvert = state.mode === 'paste' && state.text.length > 0 && state.text.length <= AUTO_CONVERT_MAX_CHARS;
  const optionsKey = JSON.stringify(state.options);
  useEffect(() => {
    if (!autoConvert) return;
    const t = setTimeout(() => {
      if (stateRef.current.phase !== 'converting') void convert();
    }, 350);
    return () => clearTimeout(t);
  }, [autoConvert, state.text, optionsKey, convert]);

  const settingsChanged = state.phase === 'done' && state.resultOptions !== null && state.resultOptions !== optionsKey;
  const validCount = state.items.filter((i) => !i.issue).length;

  return {
    state,
    fields,
    validCount,
    settingsChanged,
    autoConvert,
    outputExt: OUTPUT_TYPE[conversion.to].ext,
    addFiles,
    removeFile: (id: string) => dispatch({ type: 'remove', id }),
    moveFile: (id: string, delta: number) => dispatch({ type: 'move', id, delta }),
    clear: () => {
      abortRef.current?.abort();
      dispatch({ type: 'clear' });
    },
    setMode: (mode: InputMode) => dispatch({ type: 'mode', mode }),
    setText: (text: string) => {
      dispatch({ type: 'text', text });
      preload();
    },
    setOption: (key: string, value: OptionValues[string]) => dispatch({ type: 'option', key, value }),
    dismissNotice: () => dispatch({ type: 'dismissNotice' }),
    convert,
    cancel,
    preload,
  };
}
