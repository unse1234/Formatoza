import { useId, useState } from 'react';
import { isFieldVisible, type OptionField, type OptionValues } from '~/engines/options';
import { ChevronIcon, SettingsIcon } from './icons';

interface Props {
  fields: OptionField[];
  values: OptionValues;
  disabled: boolean;
  onChange: (key: string, value: OptionValues[string]) => void;
  defaultOpen?: boolean;
}

function summary(fields: OptionField[], values: OptionValues): string {
  const parts: string[] = [];
  for (const f of fields) {
    if (!isFieldVisible(f, values) || values[f.key] === f.default) continue;
    const v = values[f.key];
    if (f.type === 'select') parts.push(f.choices.find((c) => c.value === v)?.label ?? String(v));
    else if (f.type === 'boolean') parts.push(`${f.label}: ${v ? 'on' : 'off'}`);
    else if (f.type === 'range' || f.type === 'number') parts.push(`${f.label} ${v}${f.unit ?? ''}`);
    else parts.push(`${f.label}: ${String(v) || '—'}`);
  }
  return parts.length ? parts.slice(0, 3).join(' · ') + (parts.length > 3 ? ' …' : '') : 'Default settings';
}

export function SettingsPanel({ fields, values, disabled, onChange, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const baseId = useId();
  if (!fields.length) return null;
  const visible = fields.filter((f) => isFieldVisible(f, values));

  return (
    <div className="rounded-lg bg-surface shadow-border">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left hover:bg-hover/50"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <SettingsIcon className="shrink-0 text-fg-2" />
        <span className="text-sm font-medium text-fg">Settings</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-fg-3">{summary(fields, values)}</span>
        <ChevronIcon className={`shrink-0 text-fg-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id={panelId} hidden={!open} className="px-4 pt-1 pb-4">
        <fieldset disabled={disabled} className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <legend className="sr-only">Conversion settings</legend>
          {visible.map((f) => {
            const id = `${baseId}-${f.key}`;
            const helpId = f.help ? `${id}-help` : undefined;
            const v = values[f.key];
            const help = f.help ? (
              <p id={helpId} className="mt-1.5 text-xs leading-snug text-fg-3">
                {f.help}
              </p>
            ) : null;
            if (f.type === 'boolean')
              return (
                <div key={f.key} className="sm:col-span-2">
                  <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
                    <input
                      id={id}
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--fg)]"
                      checked={v === true}
                      aria-describedby={helpId}
                      onChange={(e) => onChange(f.key, e.target.checked)}
                    />
                    <span className="text-sm text-fg">{f.label}</span>
                  </label>
                  {help && <div className="pl-7">{help}</div>}
                </div>
              );
            return (
              <div key={f.key}>
                <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-fg-2">
                  {f.label}
                  {f.type === 'range' && (
                    <span className="font-mono text-xs text-fg">
                      {String(v)}
                      {f.unit}
                    </span>
                  )}
                </label>
                {f.type === 'select' && (
                  <select id={id} className="field cursor-pointer" value={String(v)} aria-describedby={helpId} onChange={(e) => onChange(f.key, e.target.value)}>
                    {f.choices.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                )}
                {f.type === 'range' && (
                  <input
                    id={id}
                    type="range"
                    className="h-10 w-full cursor-pointer accent-[var(--fg)]"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={Number(v)}
                    aria-describedby={helpId}
                    onChange={(e) => onChange(f.key, Number(e.target.value))}
                  />
                )}
                {f.type === 'number' && (
                  <div className="relative">
                    <input
                      id={id}
                      type="number"
                      inputMode="numeric"
                      className="field pr-12"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={Number(v)}
                      aria-describedby={helpId}
                      onChange={(e) => onChange(f.key, e.target.value === '' ? f.default : Number(e.target.value))}
                    />
                    {f.unit && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 font-mono text-xs text-fg-3">{f.unit}</span>}
                  </div>
                )}
                {f.type === 'text' && (
                  <input
                    id={id}
                    type="text"
                    className="field"
                    maxLength={f.maxLength}
                    placeholder={f.placeholder}
                    value={String(v)}
                    aria-describedby={helpId}
                    onChange={(e) => onChange(f.key, e.target.value)}
                  />
                )}
                {f.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <input
                      id={id}
                      type="color"
                      className="h-10 w-12 cursor-pointer rounded-md bg-surface p-1 shadow-border"
                      value={String(v)}
                      aria-describedby={helpId}
                      onChange={(e) => onChange(f.key, e.target.value)}
                    />
                    <span className="font-mono text-xs text-fg-2">{String(v)}</span>
                    {['#ffffff', '#000000'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="size-6 rounded-full shadow-border"
                        style={{ background: c }}
                        onClick={() => onChange(f.key, c)}
                        aria-label={`Use ${c === '#ffffff' ? 'white' : 'black'}`}
                      />
                    ))}
                  </div>
                )}
                {help}
              </div>
            );
          })}
        </fieldset>
      </div>
    </div>
  );
}
