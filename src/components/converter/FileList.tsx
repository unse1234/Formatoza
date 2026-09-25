import { formatBytes } from '~/lib/file/format';
import type { Item } from './useConverter';
import { FilePreview } from './FilePreview';
import { ArrowDownIcon, ArrowUpIcon, XIcon } from './icons';
import { IssueBody } from './IssueBody';
import { describeIssue, fmt, useUi } from './i18n';

interface Props {
  items: Item[];
  orderMatters: boolean;
  disabled: boolean;
  onRemove: (id: string) => void;
  onMove: (id: string, delta: number) => void;
  vars: { from: string; limit: string; max: number };
}

export function FileList({ items, orderMatters, disabled, onRemove, onMove, vars }: Props) {
  const t = useUi();
  const l = t.fileList;
  return (
    <ul
      className="divide-y divide-[var(--border)] overflow-hidden rounded-lg bg-surface shadow-border"
      aria-label={l.label}
    >
      {items.map((item, i) => (
        <li
          key={item.id}
          className="animate-fade flex items-center gap-3 px-3 py-2.5 sm:px-4"
          data-testid="file-item"
        >
          {orderMatters && (
            <span className="w-5 shrink-0 text-right font-mono text-xs text-fg-3">{i + 1}</span>
          )}
          <FilePreview file={item.file} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg" title={item.file.name}>
              {item.file.name}
            </p>
            {item.issue ? (
              <p className="mt-0.5 flex items-start gap-1.5 text-[13px] text-fg-2">
                <span className="dot mt-1.5 bg-dot-red" aria-hidden="true" />
                <span>
                  <span className="sr-only">{l.cannotConvert}</span>
                  <IssueBody issue={describeIssue(item.issue, t, vars)} />
                </span>
              </p>
            ) : (
              <p className="mt-0.5 text-[13px] text-fg-3">{formatBytes(item.file.size)}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {orderMatters && items.length > 1 && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => onMove(item.id, -1)}
                  disabled={disabled || i === 0}
                  aria-label={fmt(l.moveUp, { name: item.file.name })}
                >
                  <ArrowUpIcon />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  onClick={() => onMove(item.id, 1)}
                  disabled={disabled || i === items.length - 1}
                  aria-label={fmt(l.moveDown, { name: item.file.name })}
                >
                  <ArrowDownIcon />
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => onRemove(item.id)}
              disabled={disabled}
              aria-label={fmt(l.remove, { name: item.file.name })}
            >
              <XIcon />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
