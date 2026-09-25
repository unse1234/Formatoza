import { describe, expect, it } from 'vitest';
import { parsePageRange, placeImage } from '~/engines/pdf/pages';
import { itemsToText } from '~/engines/pdf/text';

describe('page ranges', () => {
  it('parses lists, ranges and open ranges', () => {
    expect(parsePageRange('', 5)).toEqual([1, 2, 3, 4, 5]);
    expect(parsePageRange('all', 3)).toEqual([1, 2, 3]);
    expect(parsePageRange('1-3, 5', 10)).toEqual([1, 2, 3, 5]);
    expect(parsePageRange('8-', 10)).toEqual([8, 9, 10]);
    expect(parsePageRange('-2', 10)).toEqual([1, 2]);
    expect(parsePageRange('3 1 3', 10)).toEqual([1, 3]);
    expect(parsePageRange('2-99', 4)).toEqual([2, 3, 4]);
  });
  it('rejects invalid selections', () => {
    expect(() => parsePageRange('5-2', 10)).toThrow(/not a valid page range/);
    expect(() => parsePageRange('abc', 10)).toThrow(/not a page number/);
    expect(() => parsePageRange('20', 10)).toThrow(/contains no page/);
    expect(() => parsePageRange('0', 10)).toThrow(/start at 1/);
  });
});

describe('image placement', () => {
  it('fits pages to images at 96 DPI', () => {
    expect(placeImage({ width: 800, height: 600 }, 'fit', 'auto', 0)).toEqual({
      page: { width: 600, height: 450 },
      x: 0,
      y: 0,
      width: 600,
      height: 450,
    });
  });
  it('caps giant pages at 200 inches', () => {
    const p = placeImage({ width: 40_000, height: 10_000 }, 'fit', 'auto', 0);
    expect(p.page.width).toBeCloseTo(14_400);
  });
  it('centres on A4, rotates for landscape images and never upscales', () => {
    const land = placeImage({ width: 4000, height: 3000 }, 'a4', 'auto', 36);
    expect(land.page.width).toBeGreaterThan(land.page.height);
    expect(land.height).toBeCloseTo(595.28 - 72); // height-limited: 4:3 image in a 770×523 box
    const small = placeImage({ width: 100, height: 100 }, 'letter', 'portrait', 0);
    expect(small).toMatchObject({ width: 75, height: 75, x: (612 - 75) / 2, y: (792 - 75) / 2 });
  });
});

describe('text reconstruction', () => {
  it('builds lines from positioned items', () => {
    const items = [
      { str: 'Hello', transform: [12, 0, 0, 12, 50, 700], width: 30 },
      { str: 'world', transform: [12, 0, 0, 12, 85, 700], width: 30 },
      { str: 'Next line', transform: [12, 0, 0, 12, 50, 680], width: 50, hasEOL: true },
      { str: 'Third', transform: [12, 0, 0, 12, 50, 660], width: 30 },
    ];
    expect(itemsToText(items)).toBe('Hello world\nNext line\nThird');
  });
});
