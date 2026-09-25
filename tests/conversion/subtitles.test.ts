import { describe, expect, it } from 'vitest';
import { subtitlesEngine as engine, prepareCues } from '~/engines/subtitles';
import { parseTimestamp, formatTimestamp, balanceTags } from '~/engines/subtitles/model';
import { detectSubtitleFormat, parseAss, parseSrt, parseVtt } from '~/engines/subtitles/parse';
import { abortedSignal, fixture, golden, outputText, textFile } from './helpers';

const convert = (files: File[], from: string, to: string, options = {}, signal?: AbortSignal) =>
  engine.convert(
    { files, from: from as never, to: to as never },
    options,
    signal ? { signal } : undefined,
  );

describe('timestamps', () => {
  it('parses all common forms', () => {
    expect(parseTimestamp('00:01:02,500')).toBe(62_500);
    expect(parseTimestamp('01:02.500')).toBe(62_500);
    expect(parseTimestamp('0:01:02.50')).toBe(62_500);
    expect(parseTimestamp('00:00:01,5')).toBe(1_500);
    expect(parseTimestamp('10:00:00.000')).toBe(36_000_000);
    expect(parseTimestamp('00:61:00,000')).toBeNull();
    expect(parseTimestamp('nonsense')).toBeNull();
  });
  it('formats per target', () => {
    expect(formatTimestamp(3_723_456, 'srt')).toBe('01:02:03,456');
    expect(formatTimestamp(3_723_456, 'vtt')).toBe('01:02:03.456');
    expect(formatTimestamp(3_723_456, 'ass')).toBe('1:02:03.46');
    expect(formatTimestamp(65_000, 'txt')).toBe('01:05');
  });
  it('balances tags', () => {
    expect(balanceTags('<i>a <b>b</i> c')).toBe('<i>a <b>b</b></i><b> c</b>');
    expect(balanceTags('</i>x<u>y')).toBe('x<u>y</u>');
  });
});

describe('format detection', () => {
  it('recognises formats', async () => {
    expect(detectSubtitleFormat(await fixture('sample.srt').text())).toBe('srt');
    expect(detectSubtitleFormat(await fixture('sample.vtt').text())).toBe('vtt');
    expect(detectSubtitleFormat(await fixture('sample.ass').text())).toBe('ass');
  });
  it('tells you when the wrong converter is used', async () => {
    const r = await convert([fixture('sample.ass', 'x.srt')], 'srt', 'vtt');
    expect(r.errors[0]!.message).toMatch(/looks like a ASS file|ASS/);
  });
});

describe('SRT → VTT', () => {
  it('converts the sample (golden)', async () => {
    const r = await convert([fixture('sample.srt')], 'srt', 'vtt');
    const vtt = await outputText(r);
    await expect(vtt).toMatchFileSnapshot(golden('srt-to-vtt.vtt'));
    expect(
      vtt.startsWith('WEBVTT\n\n00:00:01.000 --> 00:00:03.500\n<i>Previously…</i> Ünïcödé 👋'),
    ).toBe(true);
    expect(vtt).toContain('00:00:04.000 --> 00:00:06.250 line:0');
    expect(vtt).toContain('You know exactly what &amp; why.');
    expect(r.warnings.some((w) => /Font colors/.test(w.message))).toBe(true);
  });
  it('shifts timings and drops cues before zero', async () => {
    const r = await convert([fixture('sample.srt')], 'srt', 'vtt', { offsetMs: -2000 });
    const vtt = await outputText(r);
    expect(vtt).toContain('00:00:00.000 --> 00:00:01.500');
    expect(vtt).toContain('00:00:07.100 --> 00:00:09.000');
  });
  it('reads Windows-1252 files and writes UTF-8', async () => {
    const r = await convert([fixture('cp1252.srt')], 'srt', 'vtt');
    expect(await outputText(r)).toContain('Café it’s open');
    expect(r.warnings.some((w) => /Windows-1252/.test(w.message))).toBe(true);
  });
  it('tolerates missing counters, LF endings and extra blank lines', () => {
    const p = parseSrt(
      '\n\n00:00:01,000 --> 00:00:02,000\nA\n\n\n\n00:00:03,000 --> 00:00:04,000\nB\n',
    );
    expect(p.cues.map((c) => c.text)).toEqual(['A', 'B']);
  });
  it('rejects empty and non-subtitle input', async () => {
    expect((await convert([textFile('   ', 'e.srt')], 'srt', 'vtt')).errors[0]!.code).toBe(
      'EMPTY_INPUT',
    );
    expect((await convert([textFile('hello world', 'x.srt')], 'srt', 'vtt')).errors[0]!.code).toBe(
      'MALFORMED_INPUT',
    );
  });
  it('escapes text so VTT stays valid', async () => {
    const vtt = await outputText(
      await convert(
        [textFile('1\n00:00:01,000 --> 00:00:02,000\na < b --> c & d\n', 'x.srt')],
        'srt',
        'vtt',
      ),
    );
    expect(vtt).toContain('a &lt; b --&gt; c &amp; d');
  });
});

describe('VTT → SRT / TXT', () => {
  it('drops VTT-only features and numbers cues (golden)', async () => {
    const r = await convert([fixture('sample.vtt')], 'vtt', 'srt');
    const srt = await outputText(r);
    await expect(srt).toMatchFileSnapshot(golden('vtt-to-srt.srt'));
    expect(srt.startsWith('1\r\n00:00:01,000 --> 00:00:03,500\r\n{\\an8}Previously…')).toBe(true);
    expect(srt).toContain('We need to <b>talk</b> & listen.');
    expect(srt).not.toContain('NOTE');
    expect(srt).not.toContain('::cue');
  });
  it('builds a de-duplicated transcript (golden)', async () => {
    const txt = await outputText(await convert([fixture('sample.vtt')], 'vtt', 'txt'));
    await expect(txt).toMatchFileSnapshot(golden('vtt-to-txt.txt'));
    expect(txt.match(/Rolling line two/g)).toHaveLength(1);
  });
  it('can keep timestamps', async () => {
    const txt = await outputText(
      await convert([fixture('sample.vtt')], 'vtt', 'txt', { timestamps: true }),
    );
    expect(txt.split('\n')[0]).toBe('[00:01] Previously…');
  });
  it('parses VTT without hours and with identifiers', () => {
    const p = parseVtt('WEBVTT\n\nid1\n00:01.000 --> 00:02.000\nHi\n');
    expect(p.cues[0]).toMatchObject({ start: 1000, end: 2000, text: 'Hi' });
  });
});

describe('ASS', () => {
  it('ASS → SRT keeps dialogue with commas, converts tags, skips comments (golden)', async () => {
    const r = await convert([fixture('sample.ass')], 'ass', 'srt');
    const srt = await outputText(r);
    await expect(srt).toMatchFileSnapshot(golden('ass-to-srt.srt'));
    expect(srt).toContain('<i>Previously, on the show…</i>');
    expect(srt).toContain('Welcome, friends\r\nSecond line');
    expect(srt).toContain('Karaoke <b>bold</b>');
    expect(srt).not.toContain('hidden');
    expect(r.warnings.some((w) => /Positioning/.test(w.message))).toBe(true);
  });
  it('SRT → ASS writes a script with a Default style (golden)', async () => {
    const ass = await outputText(
      await convert([fixture('sample.srt')], 'srt', 'ass', {
        fontName: 'Noto Sans',
        fontSize: 48,
        resolution: '1280x720',
      }),
    );
    await expect(ass).toMatchFileSnapshot(golden('srt-to-ass.ass'));
    expect(ass).toContain('PlayResX: 1280\nPlayResY: 720');
    expect(ass).toContain('Style: Default,Noto Sans,48,');
    expect(ass).toContain(
      'Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\\i1}Previously…{\\i0} Ünïcödé 👋',
    );
    expect(ass).toContain('{\\an8}We need to talk.\\N- About what?');
  });
  it('drops vector drawings', () => {
    const p = parseAss(
      '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:01.00,0:00:02.00,Default,,0,0,0,,{\\p1}m 0 0 l 100 0{\\p0}Text\n',
    );
    expect(p.cues[0]!.text).toBe('Text');
  });
});

describe('SRT → TXT', () => {
  it('joins lines into paragraphs at pauses and speaker dashes (golden)', async () => {
    const txt = await outputText(await convert([fixture('sample.srt')], 'srt', 'txt'));
    await expect(txt).toMatchFileSnapshot(golden('srt-to-txt.txt'));
    expect(txt).toBe(
      'Previously… Ünïcödé 👋 We need to talk.\n\n- About what?\n\nYou know exactly what & why.\n',
    );
  });
});

describe('robustness', () => {
  it('repairs negative durations and sorts cues', () => {
    const { cues, notes } = prepareCues(
      [
        { start: 5000, end: 4000, text: 'b' },
        { start: 1000, end: 2000, text: 'a' },
      ],
      0,
    );
    expect(cues.map((c) => c.text)).toEqual(['a', 'b']);
    expect(cues[1]!.end).toBe(6000);
    expect(notes).toHaveLength(2);
  });
  it('handles a large file (5,000 cues)', async () => {
    let srt = '';
    for (let i = 0; i < 5000; i++)
      srt += `${i + 1}\n${formatTimestamp(i * 2000, 'srt')} --> ${formatTimestamp(i * 2000 + 1500, 'srt')}\nLine ${i} ✓\n\n`;
    const r = await convert([textFile(srt, 'big.srt')], 'srt', 'vtt');
    expect((await outputText(r)).split('-->').length - 1).toBe(5000);
  });
  it('converts multiple files with unique, safe names', async () => {
    const r = await convert(
      [
        fixture('sample.srt', 'a.srt'),
        fixture('sample.srt', 'A.srt'),
        fixture('sample.srt', 'x\u202e.srt'),
      ],
      'srt',
      'vtt',
    );
    expect(r.outputs.map((o) => o.name)).toEqual(['a.vtt', 'A (2).vtt', 'x_.vtt']);
  });
  it('honours cancellation', async () => {
    await expect(
      convert([fixture('sample.srt')], 'srt', 'vtt', {}, abortedSignal()),
    ).rejects.toMatchObject({ code: 'ABORTED' });
  });
});
