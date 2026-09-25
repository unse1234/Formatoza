import { describe, expect, it } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { dataEngineCore as engine } from '~/engines/data/core';
import { typedValue, treeToTable, findRecords } from '~/engines/data/table';
import { parseDelimited } from '~/engines/data/delimited';
import { columnLetter, sheetNames } from '~/engines/data/xlsx';
import { abortedSignal, fixture, golden, outputText, textFile } from './helpers';

const convert = (files: File[], from: string, to: string, options = {}, signal?: AbortSignal) =>
  engine.convert(
    { files, from: from as never, to: to as never },
    options,
    signal ? { signal } : undefined,
  );

describe('typing rules', () => {
  it('only converts numbers losslessly', () => {
    expect(typedValue('42')).toBe(42);
    expect(typedValue('-3.25')).toBe(-3.25);
    expect(typedValue('007')).toBe('007');
    expect(typedValue('1.50')).toBe('1.50');
    expect(typedValue('1e3')).toBe('1e3');
    expect(typedValue('+44')).toBe('+44');
    expect(typedValue('12345678901234567890')).toBe('12345678901234567890');
    expect(typedValue('true')).toBe(true);
    expect(typedValue('True')).toBe('True');
    expect(typedValue('')).toBe('');
    expect(typedValue('4111111111111111', { maxDigits: 15 })).toBe('4111111111111111');
  });
});

describe('CSV parsing', () => {
  it('detects semicolons and keeps quoted delimiters/newlines', () => {
    const r = parseDelimited('a;b\n"x;y";"line1\nline2"\n', { delimiter: 'auto', header: true });
    expect(r.delimiter).toBe(';');
    expect(r.table.rows).toEqual([['x;y', 'line1\nline2']]);
  });
  it('reports short, long and unclosed rows instead of dropping them', () => {
    const r = parseDelimited('a,b,c\n1,2,3\n4,5\n6,7,8,9\n', { delimiter: ',', header: true });
    expect(r.table.columns).toEqual(['a', 'b', 'c', 'column_4']);
    expect(r.table.rows[1]).toEqual(['4', '5', '', '']);
    expect(r.table.rows[2]).toEqual(['6', '7', '8', '9']);
    expect(r.warnings.map((w) => w.message).join(' ')).toMatch(/Row 3 had fewer.*Row 4 had more/s);
  });
  it('dedupes and fills header names', () => {
    const r = parseDelimited('name,,name\n1,2,3\n', { delimiter: ',', header: true });
    expect(r.table.columns).toEqual(['name', 'column_2', 'name_2']);
  });
});

describe('CSV → JSON', () => {
  it('converts the sample (golden)', async () => {
    const r = await convert([fixture('sample.csv')], 'csv', 'json');
    expect(r.errors).toEqual([]);
    const json = await outputText(r);
    await expect(json).toMatchFileSnapshot(golden('csv-to-json.json'));
    const data = JSON.parse(json);
    expect(data[0]).toMatchObject({ id: 1, zip: '01310-100', active: true, score: 9.5 });
    expect(data[1].name).toBe('Lee, Min-jun');
    expect(data[2].name).toBe('Zoë "Z" Müller');
    expect(data[2].score).toBe('1.50');
    expect(r.outputs[0]!.name).toBe('sample.json');
  });
  it('supports no header, nested dotted columns and indentation', async () => {
    const noHeader = JSON.parse(
      await outputText(
        await convert([textFile('1,2\n3,4\n', 'x.csv')], 'csv', 'json', { header: false }),
      ),
    );
    expect(noHeader).toEqual([
      [1, 2],
      [3, 4],
    ]);
    const nested = JSON.parse(
      await outputText(
        await convert(
          [textFile('id,address.city,address.zip\n1,Paris,75001\n', 'x.csv')],
          'csv',
          'json',
          { unflatten: true },
        ),
      ),
    );
    expect(nested).toEqual([{ id: 1, address: { city: 'Paris', zip: 75001 } }]);
    const minified = await outputText(
      await convert([textFile('a\n1\n', 'x.csv')], 'csv', 'json', { indent: '0' }),
    );
    expect(minified).toBe('[{"a":1}]\n');
  });
  it('never creates prototype-polluting keys', async () => {
    const out = JSON.parse(
      await outputText(
        await convert([textFile('__proto__.polluted,constructor\n1,2\n', 'x.csv')], 'csv', 'json', {
          unflatten: true,
        }),
      ),
    );
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    expect(Object.keys(out[0])).toEqual(['__proto___', 'constructor_']);
  });
  it('handles malformed rows with warnings', async () => {
    const r = await convert([fixture('malformed.csv')], 'csv', 'json');
    expect(r.outputs).toHaveLength(1);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
  it('rejects empty input', async () => {
    const r = await convert([textFile('   \n', 'empty.csv')], 'csv', 'json');
    expect(r.outputs).toHaveLength(0);
    expect(r.errors[0]!.code).toBe('EMPTY_INPUT');
  });
  it('handles a large-ish file (50,000 rows)', async () => {
    const rows = ['id,name,value'];
    for (let i = 0; i < 50_000; i++) rows.push(`${i},"Name, ${i}",${i * 1.5}`);
    const t0 = Date.now();
    const r = await convert([textFile(rows.join('\n'), 'big.csv')], 'csv', 'json');
    const data = JSON.parse(await outputText(r));
    expect(data).toHaveLength(50_000);
    expect(data[49_999]).toEqual({ id: 49_999, name: 'Name, 49999', value: 74998.5 });
    expect(Date.now() - t0).toBeLessThan(10_000);
  });
  it('converts multiple files and sanitises names', async () => {
    const r = await convert(
      [
        textFile('a\n1\n', '../../etc/pass:wd.csv'),
        textFile('a\n2\n', 'con.csv'),
        textFile('a\n3\n', 'CON.csv'),
      ],
      'csv',
      'json',
    );
    expect(r.outputs.map((o) => o.name)).toEqual([
      'pass_wd.json',
      'con_file.json',
      'CON_file (2).json',
    ]);
  });
  it('honours cancellation', async () => {
    await expect(
      convert([fixture('sample.csv')], 'csv', 'json', {}, abortedSignal()),
    ).rejects.toMatchObject({ code: 'ABORTED' });
  });
});

describe('JSON → CSV / TSV', () => {
  it('flattens nested objects, unions columns, stringifies arrays (golden)', async () => {
    const csv = await outputText(await convert([fixture('sample.json')], 'json', 'csv'));
    await expect(csv).toMatchFileSnapshot(golden('json-to-csv.csv'));
    expect(csv.split('\r\n')[0]).toBe('id,name,tags,address.city,address.zip,active,note');
    expect(csv).toContain('"[""admin"",""editor""]"');
  });
  it('finds records inside an envelope and reads JSON Lines', async () => {
    const env = await convert([fixture('envelope.json')], 'json', 'csv');
    expect(await outputText(env)).toBe('a,b\r\n1,\r\n2,x');
    expect(env.warnings[0]!.message).toMatch(/data\.items/);
    const lines = await convert([fixture('lines.jsonl', 'lines.json')], 'json', 'tsv');
    expect(await outputText(lines)).toBe('a\tb\r\n1\t\r\n2\ttwo');
  });
  it('writes semicolons, BOM and neutralised formulas when asked', async () => {
    const r = await convert(
      [textFile('[{"a":"=1+1","b":-5,"c":"x;y"}]', 'f.json')],
      'json',
      'csv',
      { outDelimiter: ';', bom: true, escapeFormulas: true },
    );
    const bytes = new Uint8Array(await r.outputs[0]!.blob.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(await outputText(r)).toBe('a;b;c\r\n\'=1+1;-5;"x;y"');
  });
  it('reports malformed JSON with line and column', async () => {
    const r = await convert([fixture('malformed.json')], 'json', 'csv');
    expect(r.errors[0]!.code).toBe('MALFORMED_INPUT');
    expect(r.errors[0]!.message).toMatch(/line 3, column \d+: trailing comma/);
  });
  it('rejects an empty array', async () => {
    const r = await convert([textFile('[]', 'e.json')], 'json', 'csv');
    expect(r.errors[0]!.code).toBe('EMPTY_INPUT');
  });
});

describe('XML', () => {
  it('XML → JSON keeps attributes, text and repeated elements (golden)', async () => {
    const json = await outputText(await convert([fixture('sample.xml')], 'xml', 'json'));
    await expect(json).toMatchFileSnapshot(golden('xml-to-json.json'));
    const v = JSON.parse(json);
    expect(v.catalog.book[0]['@id']).toBe('bk101');
    expect(v.catalog.book[0].price).toEqual({ '#text': '44.95', '@currency': 'USD' });
    expect(v.catalog.book[0].tag).toEqual(['xml', 'dev']);
    expect(v.catalog.book[1]['dc:title']).toBe('Le Petit Prince & moi');
  });
  it('XML → CSV uses the repeating records', async () => {
    const r = await convert([fixture('sample.xml')], 'xml', 'csv', { attributePrefix: '_' });
    const csv = await outputText(r);
    await expect(csv).toMatchFileSnapshot(golden('xml-to-csv.csv'));
    expect(csv.split('\r\n')).toHaveLength(3);
    expect(csv.split('\r\n')[0]).toContain('_id');
  });
  it('reports malformed XML with a location', async () => {
    const r = await convert([fixture('malformed.xml')], 'xml', 'json');
    expect(r.errors[0]!.message).toMatch(/line 3/);
  });
  it('refuses entity declarations (billion laughs)', async () => {
    const r = await convert([fixture('entities.xml')], 'xml', 'json');
    expect(r.errors[0]!.message).toMatch(/ENTITY/);
  });
  it('JSON → XML maps arrays, attributes, nulls and invalid names', async () => {
    const xml = await outputText(
      await convert(
        [
          textFile(
            '{"lib":{"@id":"7","book":[{"title":"A & B"},{"title":"<C>"}],"2nd key":null}}',
            'x.json',
          ),
        ],
        'json',
        'xml',
      ),
    );
    expect(xml).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n<lib id="7">\n  <book>\n    <title>A &amp; B</title>\n  </book>\n  <book>\n    <title>&lt;C&gt;</title>\n  </book>\n  <_2nd_key/>\n</lib>\n',
    );
  });
  it('CSV → XML sanitises header names and wraps rows', async () => {
    const xml = await outputText(
      await convert([textFile('Unit price,2024 total\n1,2\n', 'x.csv')], 'csv', 'xml', {
        rootName: 'products',
        itemName: 'product',
      }),
    );
    expect(xml).toContain(
      '<products>\n  <product>\n    <Unit_price>1</Unit_price>\n    <_2024_total>2</_2024_total>',
    );
  });
  it('round-trips XML → JSON → XML structurally', async () => {
    const json = await outputText(await convert([fixture('sample.xml')], 'xml', 'json'));
    const xml = await outputText(await convert([textFile(json, 'x.json')], 'json', 'xml'));
    const back = await outputText(await convert([textFile(xml, 'x.xml')], 'xml', 'json'));
    expect(JSON.parse(back)).toEqual(JSON.parse(json));
  });
});

describe('YAML', () => {
  it('YAML → JSON uses YAML 1.2 core rules and resolves merges (golden)', async () => {
    const json = await outputText(await convert([fixture('sample.yaml')], 'yaml', 'json'));
    await expect(json).toMatchFileSnapshot(golden('yaml-to-json.json'));
    const v = JSON.parse(json);
    expect(v.service.enabled).toBe('yes');
    expect(v.service.country).toBe('NO');
    expect(v.worker).toEqual({ timeout: 30, queue: 'orders' });
  });
  it('combines multi-document YAML with a warning', async () => {
    const r = await convert([fixture('multi.yaml')], 'yaml', 'json');
    expect(JSON.parse(await outputText(r))).toEqual([{ a: 1 }, { a: 2 }]);
    expect(r.warnings[0]!.message).toMatch(/2 YAML documents/);
  });
  it('reports YAML syntax errors with a line number', async () => {
    const r = await convert([fixture('malformed.yaml')], 'yaml', 'json');
    expect(r.errors[0]!.message).toMatch(/line 3/);
  });
  it('rejects custom tags', async () => {
    const r = await convert([textFile('a: !Ref x\n', 'cf.yaml')], 'yaml', 'json');
    expect(r.errors[0]!.code).toBe('MALFORMED_INPUT');
  });
  it('JSON → YAML quotes ambiguous strings and keeps order', async () => {
    const yaml = await outputText(
      await convert(
        [
          textFile(
            '{"z":"yes","a":"08","n":"1.0","t":"true","s":"plain","list":[1,"no"]}',
            'x.json',
          ),
        ],
        'json',
        'yaml',
      ),
    );
    await expect(yaml).toMatchFileSnapshot(golden('json-to-yaml.yaml'));
    expect(yaml.indexOf('z:')).toBeLessThan(yaml.indexOf('a:'));
    const back = JSON.parse(
      await outputText(await convert([textFile(yaml, 'x.yaml')], 'yaml', 'json')),
    );
    expect(back).toEqual({ z: 'yes', a: '08', n: '1.0', t: 'true', s: 'plain', list: [1, 'no'] });
  });
  it('XML → YAML and YAML → XML work', async () => {
    const yaml = await outputText(await convert([fixture('sample.xml')], 'xml', 'yaml'));
    expect(yaml).toContain("'@id': bk101");
    const xml = await outputText(await convert([fixture('sample.yaml')], 'yaml', 'xml'));
    expect(xml).toContain('<ports>8080</ports>\n    <ports>8443</ports>');
  });
});

describe('TSV / CSV', () => {
  it('CSV → TSV removes unneeded quoting and keeps Unicode', async () => {
    const tsv = await outputText(await convert([fixture('sample.csv')], 'csv', 'tsv'));
    expect(tsv.split('\r\n')[2]).toBe(
      '2\tLee, Min-jun\tminjun@example.com\t서울\t04524\tfalse\t10',
    );
  });
  it('TSV → CSV quotes values with commas', async () => {
    const csv = await outputText(await convert([fixture('sample.tsv')], 'tsv', 'csv'));
    expect(csv).toBe(
      'sku,product,price,stock\r\nA-001,Desk lamp,39.90,12\r\nA-002,"Notebook, dotted",4.50,240',
    );
  });
  it('TSV → JSON types values losslessly', async () => {
    const v = JSON.parse(await outputText(await convert([fixture('sample.tsv')], 'tsv', 'json')));
    expect(v[0]).toEqual({ sku: 'A-001', product: 'Desk lamp', price: '39.90', stock: 12 });
  });
});

describe('CSV → XLSX', () => {
  it('writes a valid workbook with typed cells and a frozen header', async () => {
    const r = await convert([fixture('sample.csv'), fixture('semicolon.csv')], 'csv', 'xlsx');
    expect(r.errors).toEqual([]);
    expect(r.outputs).toHaveLength(1);
    expect(r.outputs[0]!.name).toBe('combined.xlsx');
    const zip = unzipSync(new Uint8Array(await r.outputs[0]!.blob.arrayBuffer()));
    expect(Object.keys(zip)).toEqual(
      expect.arrayContaining([
        '[Content_Types].xml',
        'xl/workbook.xml',
        'xl/worksheets/sheet1.xml',
        'xl/worksheets/sheet2.xml',
        'xl/sharedStrings.xml',
        'xl/styles.xml',
      ]),
    );
    const sheet = strFromU8(zip['xl/worksheets/sheet1.xml']!);
    const strings = strFromU8(zip['xl/sharedStrings.xml']!);
    expect(sheet).toContain('state="frozen"');
    expect(sheet).toContain('<c r="A2"><v>1</v></c>'); // numeric id
    expect(strings).toContain('<t>01310-100</t>'); // leading zero kept as text
    expect(strings).toContain('<t>1.50</t>');
    expect(strings).toContain('서울');
    expect(strFromU8(zip['xl/workbook.xml']!)).toContain('name="semicolon"');
  });
  it('can write one workbook per file', async () => {
    const r = await convert([fixture('sample.csv'), fixture('semicolon.csv')], 'csv', 'xlsx', {
      combine: 'files',
    });
    expect(r.outputs.map((o) => o.name)).toEqual(['sample.xlsx', 'semicolon.xlsx']);
  });
  it('builds valid column letters and sheet names', () => {
    expect([0, 25, 26, 701, 702, 16383].map(columnLetter)).toEqual([
      'A',
      'Z',
      'AA',
      'ZZ',
      'AAA',
      'XFD',
    ]);
    expect(sheetNames(['a/b', 'A:B', 'x'.repeat(40), 'History', ''])).toEqual([
      'a_b',
      'A_B (2)',
      'x'.repeat(31),
      'Sheet4',
      'Sheet5',
    ]);
  });
});

describe('tree helpers', () => {
  it('finds the biggest record array', () => {
    expect(findRecords({ a: [{ x: 1 }], b: { c: [{ x: 1 }, { x: 2 }] } }).path).toBe('b.c');
  });
  it('treats arrays of arrays as raw rows', () => {
    expect(
      treeToTable(
        [
          ['h1', 'h2'],
          [1, 2],
        ],
        true,
      ).table,
    ).toEqual({ columns: ['h1', 'h2'], rows: [[1, 2]] });
  });
});
