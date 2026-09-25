import { describe, expect, it } from 'vitest';
import {
  baseName,
  dedupeNames,
  extensionOf,
  outputFileName,
  sanitizeBaseName,
} from '~/lib/file/filename';
import { decodeText } from '~/lib/file/text';
import { formatBytes } from '~/lib/file/format';
import {
  defaultOptionValues,
  getOptionFields,
  isFieldVisible,
  resolveOptions,
} from '~/engines/options';
import { locateJsonError, parseJson } from '~/engines/shared/json';
import { validateFiles } from '~/engines/shared/engine-utils';
import { FORMAT_EXTENSIONS, matchesFormat } from '~/engines/shared/extensions';
import { ENGINE_PAIRS } from '~/engines/manifest';
import formats from '~/data/supported-formats.json';

describe('file names', () => {
  it('strips paths and unsafe characters', () => {
    expect(outputFileName('C:\\Users\\me\\IMG_1234.HEIC', '.jpg')).toBe('IMG_1234.jpg');
    expect(outputFileName('../../etc/passwd', 'txt')).toBe('passwd.txt');
    expect(outputFileName('a<b>c:d"e|f?g*h.png', '.jpg')).toBe('a_b_c_d_e_f_g_h.jpg');
    expect(outputFileName('evil\u202egpj.exe', '.png')).toBe('evil_gpj.png');
    expect(outputFileName('.hidden', '.txt')).toBe('hidden.txt');
    expect(outputFileName('trailing. . .csv', '.json')).toBe('trailing.json');
    expect(outputFileName('NUL.txt', '.json')).toBe('NUL_file.json');
    expect(outputFileName('', '.png')).toBe('converted.png');
    expect(outputFileName('///', '.png')).toBe('converted.png');
  });
  it('keeps Unicode and truncates safely', () => {
    expect(outputFileName('Café 東京 👋.heic', '.jpg')).toBe('Café 東京 👋.jpg');
    const long = outputFileName('👋'.repeat(200) + '.png', '.jpg');
    expect(Array.from(long.replace('.jpg', ''))).toHaveLength(120);
    expect(long).not.toMatch(/\ud83d$/);
  });
  it('dedupes case-insensitively', () => {
    expect(dedupeNames(['a.jpg', 'A.jpg', 'a.jpg', 'b.jpg'])).toEqual([
      'a.jpg',
      'A (2).jpg',
      'a (3).jpg',
      'b.jpg',
    ]);
  });
  it('parses base names and extensions', () => {
    expect(baseName('dir/photo.final.JPG')).toBe('photo.final');
    expect(extensionOf('photo.final.JPG')).toBe('.jpg');
    expect(sanitizeBaseName('   ')).toBe('converted');
  });
});

describe('text decoding', () => {
  it('handles BOMs, UTF-8 and Windows-1252 fallback', () => {
    expect(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, 0x68, 0x69]))).toEqual({
      text: 'hi',
      encoding: 'utf-8',
    });
    expect(decodeText(new Uint8Array([0xff, 0xfe, 0x68, 0x00]))).toEqual({
      text: 'h',
      encoding: 'utf-16le',
    });
    expect(decodeText(new Uint8Array([0x63, 0x61, 0x66, 0xe9]))).toEqual({
      text: 'café',
      encoding: 'windows-1252',
    });
    expect(decodeText(new TextEncoder().encode('東京'))).toEqual({
      text: '東京',
      encoding: 'utf-8',
    });
  });
});

describe('formatBytes', () => {
  it('formats sizes compactly', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(60 * 1024 * 1024)).toBe('60 MB');
    expect(formatBytes(-1)).toBe('—');
  });
});

describe('options', () => {
  it('resolves untrusted values safely', () => {
    const fields = getOptionFields('image', 'png', 'jpg');
    const v = resolveOptions(fields, {
      quality: 500,
      background: 'red;',
      maxSide: '999',
      extra: 'x',
    } as never);
    expect(v['quality']).toBe(100);
    expect(v['background']).toBe('#ffffff');
    expect(v['maxSide']).toBe('0');
    expect(v).not.toHaveProperty('extra');
    expect(defaultOptionValues(fields)).toMatchObject({ quality: 90, background: '#ffffff' });
  });
  it('evaluates visibility conditions', () => {
    const f = getOptionFields('image', 'svg', 'png').find((x) => x.key === 'svgWidth')!;
    expect(isFieldVisible(f, { svgScale: '2' })).toBe(false);
    expect(isFieldVisible(f, { svgScale: 'width' })).toBe(true);
  });
  it('defines settings for every supported pair without duplicates', () => {
    for (const [engine, pairs] of Object.entries(ENGINE_PAIRS))
      for (const [from, to] of pairs) {
        const keys = getOptionFields(engine as never, from, to).map((f) => f.key);
        expect(new Set(keys).size, `${engine} ${from}>${to}`).toBe(keys.length);
      }
  });
});

describe('JSON errors', () => {
  it('locates common mistakes', () => {
    expect(locateJsonError('{"a":1,}')).toMatchObject({
      pos: 7,
      reason: 'trailing comma before }',
    });
    expect(locateJsonError("{'a':1}")).toMatchObject({ reason: 'keys must use double quotes' });
    expect(locateJsonError('[1 2]')).toMatchObject({ pos: 3 });
    expect(locateJsonError('{"a": "x\ny"}')?.reason).toMatch(/control character/);
    expect(locateJsonError('// c\n{}')?.reason).toMatch(/comments/);
    expect(locateJsonError('{"a":[1,{"b":null}]}')).toBeNull();
  });
  it('produces line/column messages', () => {
    expect(() => parseJson('{\n  "a": tru\n}')).toThrow(/line 2, column 8/);
  });
});

describe('validation', () => {
  const limits = { maxFiles: 2, maxFileBytes: 10 };
  it('flags empty, oversized, wrong-type and too many files', () => {
    const r = validateFiles(
      {
        files: [
          new File([], 'a.png'),
          new File(['x'.repeat(20)], 'b.png'),
          new File(['x'], 'c.docx'),
        ],
        from: 'png',
        to: 'jpg',
      },
      limits,
    );
    expect(r.errors.map((e) => e.code)).toEqual([
      'TOO_MANY_FILES',
      'EMPTY_INPUT',
      'FILE_TOO_LARGE',
      'UNSUPPORTED_FORMAT',
    ]);
  });
  it('accepts pasted text for text formats', () => {
    expect(matchesFormat({ name: 'converted.csv', type: 'text/plain' }, 'csv')).toBe(true);
    expect(matchesFormat({ name: 'notes', type: '' }, 'json')).toBe(true);
    expect(matchesFormat({ name: 'photo.png', type: 'image/png' }, 'heic')).toBe(false);
  });
  it('keeps the engine extension table in sync with supported-formats.json', () => {
    for (const [id, f] of Object.entries(formats)) {
      expect(FORMAT_EXTENSIONS[id as keyof typeof FORMAT_EXTENSIONS].ext, id).toEqual(f.extensions);
      expect(FORMAT_EXTENSIONS[id as keyof typeof FORMAT_EXTENSIONS].mime, id).toEqual(f.mimeTypes);
    }
  });
});
