import { useEffect, useId, useRef, useState } from 'react';
import type { ClientConversion } from '~/lib/catalog/types';
import { pluralize } from '~/lib/file/format';
import { zipBlobs, downloadBlob } from '~/lib/file/zip';
import { baseName } from '~/lib/file/filename';
import { track } from '~/lib/analytics';
import { useConverter } from './useConverter';
import { Dropzone } from './Dropzone';
import { FileList } from './FileList';
import { SettingsPanel } from './SettingsPanel';
import { ProgressBar } from './ProgressBar';
import { ResultCard } from './ResultCard';
import { IssueList } from './IssueList';
import { sampleFor } from './samples';
import { ArrowRightIcon, DownloadIcon, ResetIcon } from './icons';

interface Props {
  conversion: ClientConversion;
}

/**
 * The converter island. Everything the user interacts with lives here; ads
 * and page content are outside it by design.
 */
export default function ConverterShell({ conversion }: Props) {
  const c = useConverter(conversion);
  const { state } = c;
  const [zipping, setZipping] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaId = useId();
  const tabBase = useId();
  const busy = state.phase === 'converting';
  const blocked = state.capability?.ok === false;
  const sample = sampleFor(conversion.from, conversion.to);
  const outputs = state.result?.outputs ?? [];
  const errors = state.result?.errors ?? [];
  const warnings = state.result?.warnings ?? [];

  // Adopt files the visitor picked or dropped before this island hydrated (see [slug].astro).
  useEffect(() => {
    const w = window as unknown as { __fzReady?: boolean; __fzPending?: File[] };
    w.__fzReady = true;
    const pending = w.__fzPending ?? [];
    w.__fzPending = [];
    if (pending.length) c.addFiles(pending);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Paste files (e.g. screenshots) from the clipboard anywhere on the page.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const files = e.clipboardData?.files;
      if (files?.length) {
        e.preventDefault();
        c.addFiles(files);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [c.addFiles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Screen-reader announcement, derived from state.
  const announcement =
    state.phase === 'converting'
      ? 'Converting…'
      : state.phase === 'done' && state.result
        ? `${pluralize(state.result.outputs.length, 'file')} ready to download${state.result.errors.length ? `, ${state.result.errors.length} failed` : ''}.`
        : state.fatal
          ? `Conversion failed: ${state.fatal.message}`
          : '';

  // Move focus to the results after a file conversion so keyboard users land on the downloads.
  useEffect(() => {
    if (state.phase === 'done' && state.result && state.mode === 'file')
      resultsRef.current?.focus({ preventScroll: false });
  }, [state.phase, state.result, state.mode]);

  // Keyboard shortcuts inside the converter: Ctrl/⌘+Enter converts, Escape cancels.
  const { convert, cancel } = c;
  const phase = state.phase;
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && phase !== 'converting') {
        e.preventDefault();
        void convert();
      } else if (e.key === 'Escape' && phase === 'converting') {
        e.preventDefault();
        cancel();
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [convert, cancel, phase]);
  const downloadAll = async () => {
    setZipping(true);
    try {
      const zip = await zipBlobs(outputs.map((o) => ({ name: o.name, blob: o.blob })));
      const first = outputs[0]?.sourceName ?? outputs[0]?.name ?? 'converted';
      downloadBlob(
        zip,
        `${baseName(first) || 'converted'}-${conversion.to}${outputs.length > 1 ? `-${outputs.length}-files` : ''}.zip`,
      );
      track('download', { tool: conversion.slug });
    } finally {
      setZipping(false);
    }
  };

  const convertLabel =
    state.mode === 'paste'
      ? `Convert to ${conversion.toName}`
      : c.validCount > 1
        ? conversion.output.combinesInputs
          ? `Combine ${c.validCount} files into ${conversion.toName}`
          : `Convert ${c.validCount} files to ${conversion.toName}`
        : `Convert to ${conversion.toName}`;

  const summary =
    state.result && state.mode === 'file'
      ? outputs.length === 0
        ? 'Nothing could be converted'
        : errors.length
          ? `${pluralize(outputs.length, 'file')} converted · ${errors.length} failed`
          : `${pluralize(outputs.length, 'file')} ready`
      : null;

  return (
    <div ref={rootRef} className="grid gap-4" data-phase={state.phase} data-testid="converter">
      <section
        className="card-raised overflow-hidden"
        aria-label={`${conversion.fromName} to ${conversion.toName} converter`}
      >
        {/* Header strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 shadow-[0_1px_0_0_var(--border)] sm:px-5">
          <div
            className="flex items-center gap-2 font-mono text-[13px] font-medium"
            aria-hidden="true"
          >
            <span className="fmt">{conversion.fromName}</span>
            <ArrowRightIcon size={14} className="text-fg-3" />
            <span className="fmt">{conversion.toName}</span>
          </div>
          <p className="flex items-center gap-2 text-[12.5px] text-fg-3">
            <span
              className={`dot ${blocked ? 'bg-dot-red' : state.engine === 'error' ? 'bg-dot-red' : 'bg-dot-green'}`}
              aria-hidden="true"
            />
            {blocked
              ? 'Not supported in this browser'
              : state.engine === 'loading'
                ? 'Loading converter…'
                : 'Runs in your browser · nothing uploaded'}
          </p>
        </div>

        <div className="grid gap-4 p-4 sm:p-5">
          {blocked && (
            <div
              role="alert"
              className="flex gap-3 rounded-lg bg-surface-2 p-4 text-sm text-fg-2 shadow-border"
              data-testid="capability-warning"
            >
              <span className="dot mt-1.5 bg-dot-red" aria-hidden="true" />
              <p>{state.capability?.message}</p>
            </div>
          )}

          {conversion.input.textInput && (
            <div
              role="tablist"
              aria-label="Input method"
              className="inline-flex w-fit gap-1 rounded-lg bg-surface-2 p-1 shadow-border"
            >
              {(['file', 'paste'] as const).map((m) => (
                <button
                  key={m}
                  id={`${tabBase}-${m}`}
                  type="button"
                  role="tab"
                  aria-selected={state.mode === m}
                  aria-controls={`${tabBase}-panel`}
                  className={`h-8 rounded-md px-3 text-[13px] font-medium transition-colors ${state.mode === m ? 'bg-surface text-fg shadow-small' : 'text-fg-2 hover:text-fg'}`}
                  onClick={() => c.setMode(m)}
                  disabled={busy}
                >
                  {m === 'file' ? 'Upload files' : 'Paste text'}
                </button>
              ))}
            </div>
          )}

          <div
            id={`${tabBase}-panel`}
            role={conversion.input.textInput ? 'tabpanel' : undefined}
            aria-labelledby={conversion.input.textInput ? `${tabBase}-${state.mode}` : undefined}
          >
            {state.mode === 'file' ? (
              state.items.length === 0 ? (
                <Dropzone
                  conversion={conversion}
                  onFiles={c.addFiles}
                  onIntent={c.preload}
                  disabled={blocked}
                />
              ) : (
                <div className="grid gap-3">
                  <FileList
                    items={state.items}
                    orderMatters={conversion.output.combinesInputs && conversion.input.multiple}
                    disabled={busy}
                    onRemove={c.removeFile}
                    onMove={c.moveFile}
                  />
                  {conversion.input.multiple &&
                    state.items.length < conversion.input.maxFiles &&
                    !busy && (
                      <Dropzone
                        conversion={conversion}
                        onFiles={c.addFiles}
                        onIntent={c.preload}
                        disabled={blocked}
                        compact
                      />
                    )}
                </div>
              )
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor={textareaId} className="text-[13px] font-medium text-fg-2">
                      {conversion.fromName} input
                    </label>
                    <div className="flex gap-1">
                      {sample && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => c.setText(sample)}
                          disabled={busy}
                        >
                          Try an example
                        </button>
                      )}
                      {state.text && (
                        <button type="button" className="btn btn-ghost btn-sm" onClick={c.clear}>
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    id={textareaId}
                    className="field !h-auto min-h-64 resize-y py-3 font-mono !text-[13px] leading-relaxed lg:min-h-[22rem]"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    placeholder={`Paste ${conversion.fromName} here…`}
                    value={state.text}
                    onChange={(e) => c.setText(e.target.value)}
                    onFocus={c.preload}
                    data-testid="text-input"
                  />
                  <p className="text-xs text-fg-3">
                    {c.autoConvert || !state.text
                      ? 'Converts as you type.'
                      : 'Large input — press Convert (or Ctrl/⌘ + Enter).'}
                  </p>
                </div>
                <div className="grid content-start gap-2" aria-live="polite">
                  <p className="text-[13px] font-medium text-fg-2">{conversion.toName} output</p>
                  {state.fatal ? (
                    <div
                      className="flex min-h-64 gap-3 rounded-lg bg-surface-2 p-4 text-sm text-fg-2 shadow-border"
                      data-testid="error"
                    >
                      <span className="dot mt-1.5 bg-dot-red" aria-hidden="true" />
                      <p className="break-words">{state.fatal.message}</p>
                    </div>
                  ) : outputs.length ? (
                    <ul className="grid gap-3">
                      {outputs.map((o, i) => (
                        <ResultCard
                          key={`${o.name}-${i}`}
                          output={o}
                          preview={conversion.output.preview}
                          tool={conversion.slug}
                          expanded
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="flex min-h-64 items-center justify-center rounded-lg bg-surface-2/60 p-6 text-center text-sm text-fg-3 shadow-[inset_0_0_0_1px_var(--border)]">
                      {busy ? 'Converting…' : `Your ${conversion.toName} will appear here.`}
                    </div>
                  )}
                  {warnings.length > 0 && !state.fatal && (
                    <IssueList issues={warnings} tone="warning" />
                  )}
                </div>
              </div>
            )}
          </div>

          {state.notice && (
            <div
              className="flex items-start justify-between gap-3 text-[13px] text-fg-2"
              role="status"
            >
              <p className="flex gap-2">
                <span className="dot mt-1.5 bg-dot-amber" aria-hidden="true" />
                {state.notice}
              </p>
              <button
                type="button"
                className="text-fg-3 hover:text-fg"
                onClick={c.dismissNotice}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          {state.fatal && state.mode === 'file' && (
            <div
              role="alert"
              className="flex gap-3 rounded-lg bg-surface-2 p-4 text-sm text-fg-2 shadow-border"
              data-testid="error"
            >
              <span className="dot mt-1.5 bg-dot-red" aria-hidden="true" />
              <div>
                <p className="font-medium text-fg">This file could not be converted</p>
                <p className="mt-1 break-words">
                  {state.fatal.file ? `${state.fatal.file}: ` : ''}
                  {state.fatal.message}
                </p>
              </div>
            </div>
          )}

          <SettingsPanel
            fields={c.fields}
            values={state.options}
            disabled={busy}
            onChange={c.setOption}
          />

          {/* Action bar */}
          {((state.mode === 'file' && state.phase !== 'idle') ||
            (state.mode === 'paste' && !c.autoConvert && state.text)) && (
            <div className="flex min-h-10 flex-wrap items-center gap-3">
              {busy ? (
                <div className="w-full">
                  <ProgressBar
                    fraction={state.progress?.fraction ?? 0}
                    label={state.progress?.label}
                    onCancel={c.cancel}
                  />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg w-full sm:w-auto"
                    onClick={() => void c.convert()}
                    disabled={
                      blocked ||
                      (state.mode === 'file' ? c.validCount === 0 : !state.text) ||
                      (state.phase === 'done' && !c.settingsChanged && state.mode === 'file')
                    }
                    data-testid="convert"
                  >
                    {state.phase === 'done' && c.settingsChanged
                      ? 'Convert again with new settings'
                      : convertLabel}
                    <ArrowRightIcon />
                  </button>
                  {state.phase !== 'idle' && (
                    <button type="button" className="btn btn-ghost" onClick={c.clear}>
                      <ResetIcon />
                      Start over
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {busy && state.mode === 'paste' && c.autoConvert && (
            <ProgressBar
              fraction={state.progress?.fraction ?? 0}
              label={state.progress?.label}
              onCancel={c.cancel}
            />
          )}
        </div>
      </section>

      {/* Results (file mode) */}
      {state.mode === 'file' && state.result && (
        <section
          ref={resultsRef}
          tabIndex={-1}
          className="card animate-enter grid gap-4 p-4 outline-none sm:p-5"
          aria-labelledby={`${tabBase}-results`}
          data-testid="results"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id={`${tabBase}-results`}
              className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-fg"
            >
              <span
                className={`dot ${outputs.length === 0 ? 'bg-dot-red' : errors.length ? 'bg-dot-amber' : 'bg-dot-green'}`}
                aria-hidden="true"
              />
              {summary}
            </h2>
            {outputs.length > 1 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void downloadAll()}
                disabled={zipping}
                data-testid="download-all"
              >
                <DownloadIcon />
                {zipping ? 'Preparing ZIP…' : `Download all (${outputs.length}) as ZIP`}
              </button>
            )}
          </div>
          {errors.length > 0 && <IssueList issues={errors} tone="error" />}
          {warnings.length > 0 && <IssueList issues={warnings} tone="warning" />}
          {outputs.length > 0 && (
            <ul
              className={`grid gap-3 ${conversion.output.preview === 'image' && outputs.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}
            >
              {outputs.map((o, i) => (
                <ResultCard
                  key={`${o.name}-${i}`}
                  output={o}
                  preview={conversion.output.preview}
                  tool={conversion.slug}
                />
              ))}
            </ul>
          )}
          <p className="text-xs text-fg-3">
            Converted files exist only in this tab. They are discarded when you leave or press
            “Start over”.
          </p>
        </section>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </div>
  );
}
