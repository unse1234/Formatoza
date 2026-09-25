import { ConversionError } from '../types';

/**
 * Parses a page selection like "1-3, 5, 8-" against a page count.
 * Empty → all pages. Returns 1-based page numbers in document order.
 */
export function parsePageRange(spec: string, pageCount: number): number[] {
  const s = spec.trim();
  if (!s || /^all$/i.test(s)) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set<number>();
  for (const part of s.split(/[,;\s]+/).filter(Boolean)) {
    const m = /^(\d*)\s*[-–]\s*(\d*)$/.exec(part);
    if (m) {
      const a = m[1] ? Number(m[1]) : 1;
      const b = m[2] ? Number(m[2]) : pageCount;
      if (a < 1 || b < a)
        throw new ConversionError('MALFORMED_INPUT', `“${part}” is not a valid page range.`);
      for (let p = a; p <= Math.min(b, pageCount); p++) pages.add(p);
    } else if (/^\d+$/.test(part)) {
      const p = Number(part);
      if (p < 1) throw new ConversionError('MALFORMED_INPUT', `Page numbers start at 1.`);
      if (p <= pageCount) pages.add(p);
    } else
      throw new ConversionError(
        'MALFORMED_INPUT',
        `“${part}” is not a page number or range (use e.g. 1-3, 5, 8-).`,
      );
  }
  if (!pages.size)
    throw new ConversionError(
      'MALFORMED_INPUT',
      `The selection “${s}” contains no page of this ${pageCount}-page document.`,
    );
  return [...pages].sort((a, b) => a - b);
}

export interface Box {
  width: number;
  height: number;
}

const PAGE_SIZES: Record<string, Box> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};
const MAX_PAGE_PT = 14_400; // Acrobat's page-size limit (200 in)
const PX_TO_PT = 0.75; // 96 DPI

export interface Placement {
  page: Box;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where to put an image of `px` pixels on a PDF page. */
export function placeImage(
  px: Box,
  pageSize: string,
  orientation: string,
  margin: number,
): Placement {
  let w = px.width * PX_TO_PT;
  let h = px.height * PX_TO_PT;
  if (pageSize === 'fit' || !PAGE_SIZES[pageSize]) {
    const s = Math.min(1, (MAX_PAGE_PT - 2 * margin) / Math.max(w, h));
    w *= s;
    h *= s;
    return {
      page: { width: w + 2 * margin, height: h + 2 * margin },
      x: margin,
      y: margin,
      width: w,
      height: h,
    };
  }
  const base = PAGE_SIZES[pageSize]!;
  const landscape = orientation === 'landscape' || (orientation === 'auto' && px.width > px.height);
  const page = landscape ? { width: base.height, height: base.width } : { ...base };
  const boxW = page.width - 2 * margin;
  const boxH = page.height - 2 * margin;
  const s = Math.min(boxW / w, boxH / h, 1);
  w *= s;
  h *= s;
  return { page, x: (page.width - w) / 2, y: (page.height - h) / 2, width: w, height: h };
}
