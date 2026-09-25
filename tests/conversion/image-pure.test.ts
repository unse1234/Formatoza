import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodeBmpFile, decodeDib } from '~/engines/image/dib';
import { largestEntry, parseIco } from '~/engines/image/ico';
import {
  countGifFrames,
  fitCanvasLimits,
  fitWithin,
  jpegOrientation,
  svgIntrinsicSize,
} from '~/engines/image/inspect';
import { sniffBytes } from '~/lib/file/sniff';
import { FIXTURES } from './helpers';

const bytes = (name: string) => new Uint8Array(readFileSync(join(FIXTURES, name)));

describe('format sniffing', () => {
  it.each([
    ['sample.jpg', 'jpg'],
    ['sample.png', 'png'],
    ['sample.gif', 'gif'],
    ['sample.webp', 'webp'],
    ['sample.avif', 'avif'],
    ['sample.heic', 'heic'],
    ['sample.bmp', 'bmp'],
    ['sample.tiff', 'tiff'],
    ['sample.ico', 'ico'],
    ['sample.pdf', 'pdf'],
    ['sample.docx', 'zip'],
    ['sample.svg', 'svg'],
    ['not-an-image.png', 'unknown'],
  ])('%s → %s', (file, type) => expect(sniffBytes(bytes(file))).toBe(type));
});

describe('BMP / DIB decoder', () => {
  it('decodes the 24-bit fixture bottom-up with correct colors', () => {
    const img = decodeBmpFile(bytes('sample.bmp'));
    expect([img.width, img.height]).toEqual([64, 48]);
    // Top-left pixel of the source gradient: r=0, g=0, b=160, opaque.
    expect([...img.data.slice(0, 4)]).toEqual([0, 0, 160, 255]);
    // Bottom-right pixel: r≈251, g≈250.
    const o = (47 * 64 + 63) * 4;
    expect([...img.data.slice(o, o + 3)]).toEqual([251, 250, 160]);
  });
  it('rejects truncated and compressed bitmaps', () => {
    expect(() => decodeBmpFile(bytes('sample.bmp').slice(0, 100))).toThrow(/truncated/);
    const b = bytes('sample.bmp');
    new DataView(b.buffer).setUint32(14 + 16, 1, true); // BI_RLE8
    expect(() => decodeBmpFile(b)).toThrow(/Compressed/);
  });
});

describe('ICO parser', () => {
  it('lists PNG and DIB entries and picks the largest', () => {
    const b = bytes('sample.ico');
    const entries = parseIco(b);
    expect(entries.map((e) => [e.width, e.isPng])).toEqual([
      [16, false],
      [32, true],
    ]);
    expect(largestEntry(entries).width).toBe(32);
  });
  it('decodes a DIB entry with its alpha', () => {
    const b = bytes('sample.ico');
    const e = parseIco(b)[0]!;
    const img = decodeDib(b.subarray(e.offset, e.offset + e.size), true);
    expect([img.width, img.height]).toEqual([16, 16]);
    expect(img.data[3]).toBe(0); // edge pixel transparent
    expect(img.data[(8 * 16 + 8) * 4 + 3]).toBe(255);
  });
  it('rejects non-icons and empty icons', () => {
    expect(() => parseIco(bytes('sample.png'))).toThrow();
    expect(() => parseIco(new Uint8Array([0, 0, 1, 0, 0, 0]))).toThrow(/no images/);
  });
});

describe('inspection helpers', () => {
  it('counts GIF frames', () => {
    expect(countGifFrames(bytes('animated.gif'))).toBe(3);
    expect(countGifFrames(bytes('sample.gif'))).toBe(1);
    expect(countGifFrames(bytes('sample.png'))).toBe(0);
  });
  it('reads JPEG EXIF orientation', () => {
    expect(jpegOrientation(bytes('rotated.jpg'))).toBe(6);
    expect(jpegOrientation(bytes('sample.jpg'))).toBe(1);
    expect(jpegOrientation(bytes('corrupt.jpg'))).toBe(1);
  });
  it('scales only down and respects canvas limits', () => {
    expect(fitWithin(4000, 3000, 1920)).toEqual({ width: 1920, height: 1440 });
    expect(fitWithin(800, 600, 1920)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(800, 600, 0)).toEqual({ width: 800, height: 600 });
    const f = fitCanvasLimits(8064, 6048, 16_777_216, 16_384);
    expect(f.scaled).toBe(true);
    expect(f.width * f.height).toBeLessThanOrEqual(16_777_216);
    expect(fitCanvasLimits(20000, 100, 1e9, 16_384).width).toBe(16_384);
  });
  it('derives SVG intrinsic size', () => {
    expect(svgIntrinsicSize({ width: '64', height: '48' })).toEqual({
      width: 64,
      height: 48,
      fromViewBox: false,
    });
    expect(svgIntrinsicSize({ viewBox: '0 0 200 100' })).toEqual({
      width: 200,
      height: 100,
      fromViewBox: true,
    });
    expect(svgIntrinsicSize({ width: '400', viewBox: '0 0 200 100' })).toEqual({
      width: 400,
      height: 200,
      fromViewBox: true,
    });
    expect(svgIntrinsicSize({ width: '1in', height: '72pt' })).toEqual({
      width: 96,
      height: 96,
      fromViewBox: false,
    });
    expect(svgIntrinsicSize({ width: '100%' })).toEqual({
      width: 300,
      height: 150,
      fromViewBox: false,
    });
  });
});
