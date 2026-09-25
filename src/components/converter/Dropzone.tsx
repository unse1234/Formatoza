import { useId, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { formatBytes } from '~/lib/file/format';
import type { ClientConversion } from '~/lib/catalog/types';
import { UploadIcon } from './icons';

interface Props {
  conversion: ClientConversion;
  onFiles: (files: FileList | File[]) => void;
  onIntent: () => void;
  disabled?: boolean;
  compact?: boolean;
}

/**
 * Drop target + file picker. The whole area is clickable; keyboard users get
 * a real button. States: idle, drag-over (accent ring), disabled.
 */
export function Dropzone({ conversion, onFiles, onIntent, disabled = false, compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const depth = useRef(0);
  const hintId = useId();
  const { input, fromName } = conversion;
  const exts = input.extensions.filter((e) => e !== '.log' && e !== '.text').slice(0, 5).join(' ');

  const open = () => !disabled && inputRef.current?.click();
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    setOver(false);
    if (!disabled && e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={[
        'relative flex flex-col items-center justify-center rounded-lg text-center transition-[box-shadow,background-color] duration-200 ease-(--ease-swift)',
        compact ? 'gap-2 px-4 py-5 sm:flex-row sm:gap-4' : 'gap-4 px-6 py-12 sm:py-16',
        over ? 'bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] shadow-[0_0_0_2px_var(--accent)]' : 'bg-surface-2/60 shadow-[inset_0_0_0_1px_var(--border-strong)] [background-image:none]',
        disabled ? 'opacity-60' : 'cursor-pointer',
      ].join(' ')}
      onClick={open}
      onPointerEnter={onIntent}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current++;
        setOver(true);
        onIntent();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={onDrop}
      data-state={over ? 'drag-over' : 'idle'}
      data-testid="dropzone"
    >
      <span
        className={[
          'flex items-center justify-center rounded-full bg-surface shadow-small transition-colors',
          compact ? 'size-9' : 'size-12',
          over ? 'text-accent' : 'text-fg',
        ].join(' ')}
        aria-hidden="true"
      >
        <UploadIcon size={compact ? 16 : 20} />
      </span>
      <div className={compact ? 'sm:text-left' : ''}>
        <p className={compact ? 'text-sm font-medium text-fg' : 'text-base font-medium text-fg'}>
          {over ? `Drop to add ${input.multiple ? 'files' : 'the file'}` : compact ? `Add more ${fromName} files` : `Drop ${fromName} ${input.multiple ? 'files' : 'file'} here`}
        </p>
        {!compact && (
          <p id={hintId} className="mt-1 text-[13px] text-fg-3">
            {exts} · up to {formatBytes(input.maxFileBytes)} {input.multiple ? `each · ${input.maxFiles} files at a time` : ''}
          </p>
        )}
      </div>
      <button
        type="button"
        className={compact ? 'btn btn-secondary btn-sm' : 'btn btn-primary'}
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        onKeyDown={(e: KeyboardEvent) => e.stopPropagation()}
        onFocus={onIntent}
        disabled={disabled}
        aria-describedby={compact ? undefined : hintId}
      >
        {compact ? 'Choose files' : `Choose ${input.multiple ? 'files' : 'file'}`}
      </button>
      {!compact && <p className="hidden text-xs text-fg-3 sm:block">or paste {conversion.engine === 'image' ? 'an image' : 'a file'} with Ctrl/⌘ + V</p>}
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        accept={input.accept}
        multiple={input.multiple}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
