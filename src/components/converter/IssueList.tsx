import { useState } from 'react';
import type { ConversionIssue } from '~/engines/types';

interface Props {
  issues: ConversionIssue[];
  tone: 'error' | 'warning' | 'info';
  collapseAfter?: number;
}

const DOT = { error: 'bg-dot-red', warning: 'bg-dot-amber', info: 'bg-dot-blue' } as const;

export function IssueList({ issues, tone, collapseAfter = 4 }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (!issues.length) return null;
  const unique = issues.filter((x, i, all) => all.findIndex((y) => y.message === x.message && y.file === x.file) === i);
  const shown = expanded ? unique : unique.slice(0, collapseAfter);
  return (
    <div>
      <ul className="grid gap-1.5 text-[13px] leading-snug text-fg-2">
        {shown.map((x, i) => (
          <li key={i} className="flex gap-2">
            <span className={`dot mt-1.5 ${DOT[tone]}`} aria-hidden="true" />
            <span className="min-w-0">
              <span className="sr-only">{tone === 'error' ? 'Error: ' : tone === 'warning' ? 'Note: ' : ''}</span>
              {x.file && <span className="font-medium break-all text-fg">{x.file}: </span>}
              {x.message}
            </span>
          </li>
        ))}
      </ul>
      {unique.length > collapseAfter && (
        <button type="button" className="mt-2 text-[13px] text-accent hover:underline" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Show fewer' : `Show ${unique.length - collapseAfter} more`}
        </button>
      )}
    </div>
  );
}
