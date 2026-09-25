import { describe, expect, it, vi, afterEach } from 'vitest';
import { bucketDuration, bucketFiles, bucketSize, sanitizeProps, track } from '~/lib/analytics';

describe('analytics privacy', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('drops anything that could contain file data', () => {
    const clean = sanitizeProps({
      tool: 'heic-to-jpg',
      engine: 'image',
      outcome: 'success',
      files: '2-5',
      fileName: 'passport-scan.heic',
      name: 'IMG_0001.HEIC',
      content: 'SECRET',
      message: 'Invalid JSON at line 3: {"password": "x"}',
      size: 123456,
      errorCode: 'MALFORMED_INPUT',
    });
    expect(clean).toEqual({
      tool: 'heic-to-jpg',
      engine: 'image',
      outcome: 'success',
      files: '2-5',
      errorCode: 'MALFORMED_INPUT',
    });
  });
  it('rejects values outside the allowed enums', () => {
    expect(
      sanitizeProps({
        tool: '../etc/passwd',
        outcome: 'custom text',
        errorCode: 'anything',
        inputMode: 'clipboard',
      }),
    ).toEqual({});
    expect(sanitizeProps({ tool: 'a'.repeat(50) })).toEqual({});
  });
  it('buckets numbers coarsely', () => {
    expect([bucketFiles(1), bucketFiles(3), bucketFiles(12), bucketFiles(40)]).toEqual([
      '1',
      '2-5',
      '6-20',
      '21+',
    ]);
    expect([bucketSize(10), bucketSize(5e6), bucketSize(3e7), bucketSize(9e7)]).toEqual([
      '<1MB',
      '1-10MB',
      '10-50MB',
      '50MB+',
    ]);
    expect([
      bucketDuration(10),
      bucketDuration(2000),
      bucketDuration(9000),
      bucketDuration(60000),
    ]).toEqual(['<1s', '1-5s', '5-30s', '30s+']);
  });
  it('only ever hands sanitised props to a registered sink', () => {
    const sink = vi.fn();
    vi.stubGlobal('window', { __fzAnalytics: sink });
    track('convert_complete', { tool: 'csv-to-json', text: 'a,b\n1,2', outcome: 'success' });
    expect(sink).toHaveBeenCalledWith('convert_complete', {
      tool: 'csv-to-json',
      outcome: 'success',
    });
    track('unknown_event' as never, { tool: 'x' });
    expect(sink).toHaveBeenCalledTimes(1);
  });
  it('never throws when the sink fails', () => {
    vi.stubGlobal('window', {
      __fzAnalytics: () => {
        throw new Error('boom');
      },
    });
    expect(() => track('download', { tool: 'x' })).not.toThrow();
  });
});
