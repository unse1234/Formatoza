import { describe, expect, it } from 'vitest';
import { textEngine as engine } from '~/engines/text';
import {
  decodeBase64,
  encodeBase64,
  urlDecode,
  urlEncode,
  bytesAsText,
} from '~/engines/text/encoding';
import { markdownToText, markdownToHtml } from '~/engines/text/markdown';
import { abortedSignal, fixture, golden, outputText, textFile } from './helpers';

const convert = (files: File[], from: string, to: string, options = {}, signal?: AbortSignal) =>
  engine.convert(
    { files, from: from as never, to: to as never },
    options,
    signal ? { signal } : undefined,
  );

describe('Base64', () => {
  it('encodes UTF-8 text correctly, including emoji', () => {
    expect(encodeBase64('Man', { urlSafe: false, wrap: false })).toBe('TWFu');
    expect(encodeBase64('Ma', { urlSafe: false, wrap: false })).toBe('TWE=');
    expect(encodeBase64('café 👋', { urlSafe: false, wrap: false })).toBe(
      Buffer.from('café 👋').toString('base64'),
    );
    expect(encodeBase64('??>', { urlSafe: true, wrap: false })).toBe('Pz8-');
    expect(
      encodeBase64('x'.repeat(100), { urlSafe: false, wrap: true }).split('\r\n')[0],
    ).toHaveLength(76);
  });
  it('decodes tolerantly: whitespace, URL-safe, missing padding, data URLs', () => {
    expect(new TextDecoder().decode(decodeBase64(' TW\nFu ').bytes)).toBe('Man');
    const u = decodeBase64('Pz8-');
    expect(new TextDecoder().decode(u.bytes)).toBe('??>');
    expect(u.urlSafe).toBe(true);
    expect(decodeBase64('TWE').paddingAdded).toBe(true);
    expect(decodeBase64('data:text/plain;base64,TWFu').dataUrlMime).toBe('text/plain');
  });
  it('rejects invalid Base64 precisely', () => {
    expect(() => decodeBase64('TW!u')).toThrow(/position 3/);
    expect(() => decodeBase64('TWFuT')).toThrow(/truncated/);
    expect(() => decodeBase64('TW=u')).toThrow(/Padding/);
  });
  it('distinguishes text from binary', () => {
    expect(bytesAsText(new TextEncoder().encode('héllo'))).toBe('héllo');
    expect(bytesAsText(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0xff]))).toBeNull();
  });
  it('text → base64 → text round-trips Unicode', async () => {
    const b64 = await outputText(await convert([fixture('plain.txt')], 'txt', 'base64'));
    const back = await outputText(await convert([textFile(b64, 'b.txt')], 'base64', 'txt'));
    expect(back).toBe('Hello, wörld! 👋 & = ? / #\n');
  });
  it('base64 → text offers binary data as a typed file', async () => {
    const r = await convert([fixture('png.base64.txt')], 'base64', 'txt');
    expect(r.outputs[0]!.name).toBe('png.base64.png');
    expect(r.outputs[0]!.mimeType).toBe('image/png');
    expect(r.warnings[0]!.message).toMatch(/PNG image/);
  });
  it('json ↔ base64 validates, minifies and decodes JWTs', async () => {
    const b64 = await outputText(
      await convert([textFile('{\n  "a": [1, 2]\n}', 'j.json')], 'json', 'base64'),
    );
    expect(b64).toBe(Buffer.from('{"a":[1,2]}').toString('base64'));
    const bad = await convert([textFile('{"a":1,}', 'j.json')], 'json', 'base64');
    expect(bad.errors[0]!.message).toMatch(/line 1, column 8/);
    const pretty = await outputText(await convert([textFile(b64, 'b.txt')], 'base64', 'json'));
    expect(pretty).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}\n');
    const seg = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const jwt = `${seg({ alg: 'HS256', typ: 'JWT' })}.${seg({ sub: '42', exp: 1767225600 })}.sig`;
    const r = await convert([textFile(jwt, 't.txt')], 'base64', 'json');
    expect(JSON.parse(await outputText(r))).toEqual({
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { sub: '42', exp: 1767225600 },
    });
    expect(r.warnings[0]!.message).toMatch(/NOT verified/);
  });
});

describe('URL encoding', () => {
  it('encodes values strictly per RFC 3986', () => {
    expect(
      urlEncode("salt & pepper (50%) café!*'", {
        mode: 'component',
        spacePlus: false,
        perLine: false,
      }),
    ).toBe('salt%20%26%20pepper%20%2850%25%29%20caf%C3%A9%21%2A%27');
    expect(urlEncode('a b', { mode: 'component', spacePlus: true, perLine: false })).toBe('a+b');
    expect(
      urlEncode('https://x.com/a b?q=1&r=é', { mode: 'uri', spacePlus: false, perLine: false }),
    ).toBe('https://x.com/a%20b?q=1&r=%C3%A9');
    expect(urlEncode('a b\nc d', { mode: 'component', spacePlus: false, perLine: true })).toBe(
      'a%20b\nc%20d',
    );
    expect(urlEncode('\ud800x', { mode: 'component', spacePlus: false, perLine: false })).toBe(
      '%EF%BF%BDx',
    );
  });
  it('decodes leniently and repeatedly', () => {
    expect(urlDecode('caf%C3%A9+au+lait', { plusAsSpace: true, repeat: false }).text).toBe(
      'café au lait',
    );
    expect(urlDecode('1+1', { plusAsSpace: false, repeat: false }).text).toBe('1+1');
    expect(urlDecode('100% sure %zz', { plusAsSpace: true, repeat: false }).text).toBe(
      '100% sure %zz',
    );
    expect(urlDecode('a%2520b', { plusAsSpace: true, repeat: true })).toMatchObject({
      text: 'a b',
      passes: 2,
    });
    expect(urlDecode('%E9t%E9', { plusAsSpace: true, repeat: false })).toMatchObject({
      text: 'été',
      invalidSequences: 2,
    });
  });
  it('engine warns about double encoding', async () => {
    const r = await convert([textFile('a%2520b', 'u.txt')], 'urlencoded', 'txt');
    expect(await outputText(r)).toBe('a%20b');
    expect(r.warnings.some((w) => /encoded twice/.test(w.message))).toBe(true);
    const enc = await convert([textFile('50%25 off', 'u.txt')], 'txt', 'urlencoded');
    expect(enc.warnings.some((w) => /%25/.test(w.message))).toBe(true);
  });
});

describe('Markdown', () => {
  it('renders GFM to HTML (golden)', async () => {
    const html = await outputText(await convert([fixture('sample.md')], 'markdown', 'html'));
    await expect(html).toMatchFileSnapshot(golden('markdown-to-html.html'));
    expect(html).toContain('<table>');
    expect(html).toContain('<input checked="" disabled="" type="checkbox">');
    expect(html).toContain('<code class="language-js">');
  });
  it('can produce a full document and <br> line breaks', () => {
    expect(markdownToHtml('# T\n\na\nb', { gfm: true, breaks: true, fullDocument: true })).toMatch(
      /<title>T<\/title>[\s\S]*<p>a<br>b<\/p>/,
    );
  });
  it('strips Markdown to text (golden)', async () => {
    const txt = await outputText(await convert([fixture('sample.md')], 'markdown', 'txt'));
    await expect(txt).toMatchFileSnapshot(golden('markdown-to-text.txt'));
    expect(txt).not.toMatch(/\*\*|\[the blog\]|```|#/);
    expect(markdownToText('[a](https://x.y) 2 \\* 3 snake_case', { keepLinks: true })).toBe(
      'a (https://x.y) 2 * 3 snake_case\n',
    );
  });
});

describe('general', () => {
  it('rejects empty input', async () => {
    expect((await convert([textFile('  ', 'e.md')], 'markdown', 'html')).errors[0]!.code).toBe(
      'EMPTY_INPUT',
    );
  });
  it('handles a large-ish Markdown file', async () => {
    const md = Array.from(
      { length: 3000 },
      (_, i) => `## Section ${i}\n\nParagraph **${i}** with [link](https://e.com/${i}).\n`,
    ).join('\n');
    const html = await outputText(await convert([textFile(md, 'big.md')], 'markdown', 'html'));
    expect(html.match(/<h2>/g)).toHaveLength(3000);
  });
  it('converts several files with unique names', async () => {
    const r = await convert([textFile('a', 'x.txt'), textFile('b', 'x.txt')], 'txt', 'base64');
    expect(r.outputs.map((o) => o.name)).toEqual(['x.txt', 'x (2).txt']);
  });
  it('honours cancellation', async () => {
    await expect(
      convert([fixture('sample.md')], 'markdown', 'html', {}, abortedSignal()),
    ).rejects.toMatchObject({ code: 'ABORTED' });
  });
});
