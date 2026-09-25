interface Props {
  fraction: number;
  label?: string | undefined;
  onCancel: () => void;
}

export function ProgressBar({ fraction, label, onCancel }: Props) {
  const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
  const indeterminate = pct === 0;
  return (
    <div className="flex items-center gap-4" data-testid="progress">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
          <span className="flex items-center gap-2 truncate font-medium text-fg">
            <span className="dot animate-pulse bg-dot-blue" aria-hidden="true" />
            {label ?? 'Converting…'}
          </span>
          <span className="font-mono text-fg-3" aria-hidden="true">
            {indeterminate ? '' : `${pct}%`}
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-2 shadow-border"
          role="progressbar"
          aria-label="Conversion progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : pct}
          aria-valuetext={indeterminate ? 'Starting' : `${pct}%`}
        >
          {indeterminate ? (
            <div className="h-full w-2/5 rounded-full bg-fg [animation:fz-indeterminate_1.1s_ease-in-out_infinite]" />
          ) : (
            <div className="h-full rounded-full bg-fg transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
          )}
        </div>
      </div>
      <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
