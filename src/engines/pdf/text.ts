/** Rebuilds lines from PDF.js text items (pure; testable without PDF.js). */
export interface TextItemLike {
  str: string;
  hasEOL?: boolean;
  transform?: number[];
  width?: number;
  height?: number;
}

export function itemsToText(items: TextItemLike[]): string {
  let out = '';
  let lastY: number | null = null;
  let lastEndX: number | null = null;
  let lastHeight = 0;
  for (const it of items) {
    const y = it.transform?.[5] ?? null;
    const x = it.transform?.[4] ?? null;
    const h = Math.abs(it.transform?.[3] ?? it.height ?? 10) || 10;
    if (lastY !== null && y !== null && Math.abs(y - lastY) > Math.max(2, lastHeight * 0.5) && !out.endsWith('\n')) out += '\n';
    else if (lastEndX !== null && x !== null && x - lastEndX > h * 0.2 && !/\s$/.test(out) && !/^\s/.test(it.str) && out && !out.endsWith('\n')) out += ' ';
    out += it.str;
    if (it.hasEOL) out += '\n';
    if (y !== null) lastY = y;
    lastHeight = h;
    lastEndX = x !== null ? x + (it.width ?? 0) : null;
  }
  return out
    .split('\n')
    .map((l) => l.replace(/\s+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
