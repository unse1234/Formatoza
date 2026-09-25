import { useEffect, useMemo, useState } from 'react';
import type { OutputFile } from '~/engines/types';
import type { OutputSpec } from '~/lib/catalog/types';
import { formatBytes } from '~/lib/file/format';
import { track } from '~/lib/analytics';
import { CheckIcon, CopyIcon, DownloadIcon, ExternalIcon } from './icons';

const TEXT_PREVIEW_LIMIT = 150_000;

interface Props {
  output: OutputFile;
  preview: OutputSpec['preview'];
  tool: string;
  /** Show the full text inline (paste mode) instead of a compact card. */
  expanded?: boolean;
}

function kindOf(o: OutputFile, fallback: OutputSpec['preview']): OutputSpec['preview'] {
  if (o.mimeType.startsWith('image/')) return 'image';
  if (o.mimeType === 'application/pdf') return 'pdf';
  if (o.mimeType === 'text/html') return 'html';
  if (o.mimeType.startsWith('text/') || /json|xml|yaml|subrip|x-ssa/.test(o.mimeType)) return 'text';
  return fallback === 'image' || fallback === 'text' || fallback === 'html' ? 'binary' : fallback;
}

export function ResultCard({ output, preview, tool, expanded = false }: Props) {
  const url = useMemo(() => URL.createObjectURL(output.blob), [output.blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  const kind = kindOf(output, preview);
  const [text, setText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'code' | 'rendered'>('code');
  const [rendered, setRendered] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== 'text' && kind !== 'html') return;
    let alive = true;
    void output.blob.text().then((t) => alive && setText(t));
    return () => {
      alive = false;
    };
  }, [output.blob, kind]);

  useEffect(() => {
    if (view !== 'rendered' || text === null || rendered !== null) return;
    let alive = true;
    void import('~/lib/security/sanitize').then(({ sanitizeHtml }) => alive && setRendered(sanitizeHtml(text, { allowImages: true })));
    return () => {
      alive = false;
    };
  }, [view, text, rendered]);

  const copy = async () => {
    if (text === null) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track('copy', { tool });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const details = Object.entries(output.details ?? {});
  const truncated = text !== null && text.length > TEXT_PREVIEW_LIMIT;

  return (
    <li className="animate-enter overflow-hidden rounded-lg bg-surface shadow-border" data-testid="result">
      {kind === 'image' && (
        <div className="checker flex max-h-80 min-h-32 items-center justify-center overflow-hidden p-3 shadow-[0_1px_0_0_var(--border)]">
          <img src={url} alt={`Converted: ${output.name}`} className="max-h-72 max-w-full object-contain" decoding="async" />
        </div>
      )}
      {(kind === 'text' || kind === 'html') && (
        <div className="relative shadow-[0_1px_0_0_var(--border)]">
          {kind === 'html' && (
            <div className="flex gap-1 px-3 pt-2" role="tablist" aria-label="Preview mode">
              {(['code', 'rendered'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  className={`btn btn-sm ${view === v ? 'bg-hover text-fg' : 'btn-ghost'}`}
                  onClick={() => setView(v)}
                >
                  {v === 'code' ? 'HTML' : 'Preview'}
                </button>
              ))}
            </div>
          )}
          {view === 'rendered' && kind === 'html' ? (
            <iframe
              title={`Preview of ${output.name}`}
              sandbox=""
              srcDoc={rendered ?? ''}
              className={`w-full bg-white ${expanded ? 'h-[28rem]' : 'h-64'}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <pre
              className={`overflow-auto p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap text-fg scrollbar-thin [overflow-wrap:anywhere] ${expanded ? 'max-h-[28rem] min-h-40' : 'max-h-56'}`}
              tabIndex={0}
              aria-label={`Contents of ${output.name}`}
              data-testid="result-text"
            >
              {text === null ? 'Loading preview…' : truncated ? `${text.slice(0, TEXT_PREVIEW_LIMIT)}\n\n… preview truncated — download or copy for the full result.` : text || '(empty)'}
            </pre>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-medium text-fg" title={output.name}>
            <span className="dot bg-dot-green" aria-hidden="true" />
            <span className="truncate">{output.name}</span>
          </p>
          <p className="mt-0.5 truncate pl-4 text-[12.5px] text-fg-3">
            {formatBytes(output.blob.size)}
            {details.map(([k, v]) => ` · ${k}: ${v}`).join('')}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {(kind === 'text' || kind === 'html') && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={copy} disabled={text === null} aria-live="polite">
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          {kind === 'pdf' && (
            <a className="btn btn-secondary btn-sm" href={url} target="_blank" rel="noopener">
              <ExternalIcon />
              Open
            </a>
          )}
          <a className="btn btn-primary btn-sm" href={url} download={output.name} onClick={() => track('download', { tool })} data-testid="download">
            <DownloadIcon />
            Download
          </a>
        </div>
      </div>
    </li>
  );
}
