// Generates the binary/text input fixtures used by unit and browser tests.
// Deterministic; re-run with `npm run fixtures`. sample.heic is a real iPhone-
// style HEIC taken from the heic2any project (MIT) because HEVC encoders are
// not freely available — see tests/fixtures/README.md.
import sharp from 'sharp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'tests/fixtures/input';
mkdirSync(OUT, { recursive: true });
const w = (name, data) => writeFileSync(join(OUT, name), data);

// ---------------------------------------------------------------- images
const W = 64,
  H = 48;
// Gradient with a transparent circle so alpha handling is testable.
const rgba = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const inCircle = (x - 44) ** 2 + (y - 24) ** 2 < 100;
    rgba[i] = Math.round((x / W) * 255);
    rgba[i + 1] = Math.round((y / H) * 255);
    rgba[i + 2] = 160;
    rgba[i + 3] = inCircle ? 0 : 255;
  }
const base = () => sharp(rgba, { raw: { width: W, height: H, channels: 4 } });
w('sample.png', await base().png().toBuffer());
w('sample.webp', await base().webp({ quality: 90 }).toBuffer());
w('sample.avif', await base().avif({ quality: 60 }).toBuffer());
w('sample.jpg', await base().flatten({ background: '#ffffff' }).jpeg({ quality: 92 }).toBuffer());
// JPEG with EXIF orientation 6 (rotate 90° CW on display): stored 64×48, displays 48×64.
w(
  'rotated.jpg',
  await base()
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 92 })
    .withMetadata({ orientation: 6 })
    .toBuffer(),
);
w('sample.tiff', await base().tiff({ compression: 'lzw' }).toBuffer());

// Two-page, uncompressed RGBA TIFF written by hand (little-endian, one strip per page).
function multiPageTiff(pages, width, height) {
  const tags = (dataOffset, bpsOffset) => [
    [256, 3, 1, width],
    [257, 3, 1, height],
    [258, 3, 4, bpsOffset],
    [259, 3, 1, 1],
    [262, 3, 1, 2],
    [273, 4, 1, dataOffset],
    [277, 3, 1, 4],
    [278, 3, 1, height],
    [279, 4, 1, width * height * 4],
    [284, 3, 1, 1],
    [338, 3, 1, 2],
  ];
  const ifdSize = 2 + 11 * 12 + 4;
  const chunks = [];
  let offset = 8;
  const header = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0, 0, 0, 0]);
  header.writeUInt32LE(8, 4);
  chunks.push(header);
  pages.forEach((px, n) => {
    const ifdOffset = offset;
    const bpsOffset = ifdOffset + ifdSize;
    const dataOffset = bpsOffset + 8;
    const next = n < pages.length - 1 ? dataOffset + px.length : 0;
    const ifd = Buffer.alloc(ifdSize);
    const entries = tags(dataOffset, bpsOffset);
    ifd.writeUInt16LE(entries.length, 0);
    entries.forEach(([tag, type, count, value], i) => {
      const p = 2 + i * 12;
      ifd.writeUInt16LE(tag, p);
      ifd.writeUInt16LE(type, p + 2);
      ifd.writeUInt32LE(count, p + 4);
      if (type === 3 && count === 1) ifd.writeUInt16LE(value, p + 8);
      else ifd.writeUInt32LE(value, p + 8);
    });
    ifd.writeUInt32LE(next, ifdSize - 4);
    const bps = Buffer.alloc(8);
    [8, 8, 8, 8].forEach((v, i) => bps.writeUInt16LE(v, i * 2));
    chunks.push(ifd, bps, px);
    offset = dataOffset + px.length;
  });
  return Buffer.concat(chunks);
}
const page2 = Buffer.from(rgba);
for (let i = 0; i < page2.length; i += 4) {
  page2[i] = 255 - page2[i];
  page2[i + 3] = 255;
}
w('multipage.tiff', multiPageTiff([rgba, page2], W, H));

// Animated GIF (3 frames).
const frames = [0, 1, 2].map((k) => {
  const f = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    f[i * 4] = k === 0 ? 220 : 20;
    f[i * 4 + 1] = k === 1 ? 220 : 20;
    f[i * 4 + 2] = k === 2 ? 220 : 20;
    f[i * 4 + 3] = 255;
  }
  return f;
});
const framePngs = await Promise.all(
  frames.map((f) =>
    sharp(f, { raw: { width: W, height: H, channels: 4 } })
      .png()
      .toBuffer(),
  ),
);
w(
  'animated.gif',
  await sharp(framePngs, { join: { animated: true } })
    .gif({ loop: 0, delay: [200, 200, 200] })
    .toBuffer(),
);
w('sample.gif', await base().gif().toBuffer());

// 24-bit BMP written by hand (bottom-up rows, 4-byte row padding).
function bmp24(width, height, px) {
  const row = Math.ceil((width * 3) / 4) * 4;
  const size = 54 + row * height;
  const b = Buffer.alloc(size);
  b.write('BM', 0);
  b.writeUInt32LE(size, 2);
  b.writeUInt32LE(54, 10);
  b.writeUInt32LE(40, 14);
  b.writeInt32LE(width, 18);
  b.writeInt32LE(height, 22);
  b.writeUInt16LE(1, 26);
  b.writeUInt16LE(24, 28);
  b.writeUInt32LE(row * height, 34);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const s = ((height - 1 - y) * width + x) * 4;
      const d = 54 + y * row + x * 3;
      b[d] = px[s + 2];
      b[d + 1] = px[s + 1];
      b[d + 2] = px[s];
    }
  return b;
}
w('sample.bmp', bmp24(W, H, rgba));

// ICO with a 16×16 BMP (DIB + AND mask) entry and a 32×32 PNG entry.
function dibEntry(size) {
  const rowXor = size * 4;
  const rowAnd = Math.ceil(size / 32) * 4;
  const b = Buffer.alloc(40 + rowXor * size + rowAnd * size);
  b.writeUInt32LE(40, 0);
  b.writeInt32LE(size, 4);
  b.writeInt32LE(size * 2, 8);
  b.writeUInt16LE(1, 12);
  b.writeUInt16LE(32, 14);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const d = 40 + (size - 1 - y) * rowXor + x * 4;
      const edge = x < 2 || y < 2 || x >= size - 2 || y >= size - 2;
      b[d] = 40;
      b[d + 1] = 90;
      b[d + 2] = 200;
      b[d + 3] = edge ? 0 : 255;
    }
  return b;
}
const icoPng = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .resize(32, 32)
  .png()
  .toBuffer();
const entries = [
  { size: 16, data: dibEntry(16), bpp: 32 },
  { size: 32, data: icoPng, bpp: 32 },
];
const icoHead = Buffer.alloc(6 + 16 * entries.length);
icoHead.writeUInt16LE(1, 2);
icoHead.writeUInt16LE(entries.length, 4);
let off = icoHead.length;
entries.forEach((e, i) => {
  const p = 6 + 16 * i;
  icoHead[p] = e.size;
  icoHead[p + 1] = e.size;
  icoHead.writeUInt16LE(1, p + 4);
  icoHead.writeUInt16LE(e.bpp, p + 6);
  icoHead.writeUInt32LE(e.data.length, p + 8);
  icoHead.writeUInt32LE(off, p + 12);
  off += e.data.length;
});
w('sample.ico', Buffer.concat([icoHead, ...entries.map((e) => e.data)]));

w(
  'sample.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="64" height="48">
  <rect width="64" height="48" rx="8" fill="#171717"/>
  <circle cx="44" cy="24" r="10" fill="#45a557"/>
  <path d="M10 12h20M10 24h12M10 12v24" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
</svg>
`,
);
w('corrupt.jpg', Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(200, 0x41)]));
w('not-an-image.png', 'This is plain text pretending to be a PNG.\n');
w('empty.png', Buffer.alloc(0));

// ------------------------------------------------------------------- PDFs
{
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let n = 1; n <= 3; n++) {
    const page = doc.addPage([595.28, 841.89]);
    page.drawText(`Formatoza test document - page ${n}`, { x: 50, y: 780, size: 20, font });
    page.drawText(`Line one of page ${n}.`, { x: 50, y: 740, size: 12, font });
    page.drawText('Second line with numbers 12345.', { x: 50, y: 722, size: 12, font });
    page.drawRectangle({ x: 50, y: 500, width: 200, height: 120, color: rgb(0.2, 0.5, 0.8) });
  }
  doc.setTitle('Formatoza fixture');
  w('sample.pdf', await doc.save());
}
{
  // "Scanned" PDF: an image only, no text layer.
  const doc = await PDFDocument.create();
  const img = await doc.embedJpg(new Uint8Array(readFileSync(join(OUT, 'sample.jpg'))));
  const page = doc.addPage([595.28, 841.89]);
  page.drawImage(img, { x: 50, y: 400, width: 400, height: 300 });
  w('scanned.pdf', await doc.save());
}

// ------------------------------------------------------------------ Office
// A minimal but complete DOCX (WordprocessingML) built by hand: styles with
// Heading 1/2, a bulleted list, a table, a hyperlink, bold/italic runs, Unicode
// text and an embedded PNG image.
{
  const { zipSync, strToU8 } = await import('fflate');
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const run = (t, props = '') =>
    `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ''}<w:t xml:space="preserve">${esc(t)}</w:t></w:r>`;
  const para = (inner, style) =>
    `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ''}${inner}</w:p>`;
  const li = (t) =>
    `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${run(t)}</w:p>`;
  const cell = (t, bold) =>
    `<w:tc><w:tcPr><w:tcW w:w="2000" w:type="dxa"/></w:tcPr>${para(run(t, bold ? '<w:b/>' : ''))}</w:tc>`;
  const row = (a, b, bold) => `<w:tr>${cell(a, bold)}${cell(b, bold)}</w:tr>`;
  const image = `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="609600" cy="457200"/><wp:docPr id="1" name="chart" descr="chart"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="chart.png" descr="chart"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="609600" cy="457200"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  const body = [
    para(run('Quarterly report'), 'Heading1'),
    para(
      run('This document tests ') +
        run('bold', '<w:b/>') +
        run(', ') +
        run('italic', '<w:i/>') +
        run(' and a ') +
        '<w:hyperlink r:id="rIdLink1"><w:r><w:rPr><w:rStyle w:val="Hyperlink"/></w:rPr><w:t>link</w:t></w:r></w:hyperlink>' +
        run('. Ünïcödé: café, 東京, 👋.'),
    ),
    para(run('Highlights'), 'Heading2'),
    li('Revenue up 12%'),
    li('Two new markets'),
    `<w:tbl><w:tblPr><w:tblW w:w="4000" w:type="dxa"/></w:tblPr><w:tblGrid><w:gridCol w:w="2000"/><w:gridCol w:w="2000"/></w:tblGrid>${row('Region', 'Sales', true)}${row('North', '1,200')}${row('South', '980')}</w:tbl>`,
    image,
    para(run('Closing paragraph.')),
  ].join('');
  const ns =
    'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
  const files = {
    '[Content_Types].xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/></Types>',
    ),
    '_rels/.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    ),
    'word/_rels/document.xml.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdNum" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rIdLink1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.com/" TargetMode="External"/><Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/chart.png"/></Relationships>',
    ),
    'word/document.xml': strToU8(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${ns}><w:body>${body}<w:sectPr/></w:body></w:document>`,
    ),
    'word/styles.xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/></w:style></w:styles>',
    ),
    'word/numbering.xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>',
    ),
    'word/media/chart.png': new Uint8Array(readFileSync(join(OUT, 'sample.png'))),
  };
  w('sample.docx', Buffer.from(zipSync(files)));
  // A ZIP that is not a Word document.
  w('not-word.docx', Buffer.from(zipSync({ 'hello.txt': strToU8('hi') })));
}
// Legacy Word 97-2003 files start with the OLE2 compound-file signature.
w(
  'legacy.doc',
  Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(504)]),
);
// Password-protected PDF (open password "secret"), via pypdf when available.
try {
  execFileSync(
    'python3',
    [
      '-c',
      `from pypdf import PdfReader, PdfWriter
w = PdfWriter(clone_from=PdfReader("${OUT}/sample.pdf"))
w.encrypt(user_password="secret", owner_password="owner", algorithm="RC4-128")
w.write("${OUT}/encrypted.pdf")`,
    ],
    { stdio: 'inherit' },
  );
} catch {
  console.warn('pypdf not available: encrypted.pdf was not regenerated.');
}

// ------------------------------------------------------------------ text formats
w(
  'sample.csv',
  'id,name,email,city,zip,active,score\n1,Ana Souza,ana@example.com,São Paulo,01310-100,true,9.5\n2,"Lee, Min-jun",minjun@example.com,서울,04524,false,10\n3,"Zoë ""Z"" Müller",zoe@example.com,Berlin,10115,true,1.50\n',
);
w('semicolon.csv', 'produkt;preis;menge\nÄpfel;1,99;3\nBirnen;2,49;10\n');
w('malformed.csv', 'a,b,c\n1,2,3\n4,5\n6,7,8,9\n"unclosed,10,11\n');
w(
  'sample.tsv',
  'sku\tproduct\tprice\tstock\nA-001\tDesk lamp\t39.90\t12\nA-002\tNotebook, dotted\t4.50\t240\n',
);
w(
  'sample.json',
  JSON.stringify(
    [
      {
        id: 1,
        name: 'Ana Souza',
        tags: ['admin', 'editor'],
        address: { city: 'São Paulo', zip: '01310-100' },
        active: true,
      },
      {
        id: 2,
        name: 'Lee Min-jun 👋',
        tags: [],
        address: { city: '서울', zip: '04524' },
        active: false,
        note: null,
      },
    ],
    null,
    2,
  ) + '\n',
);
w(
  'envelope.json',
  JSON.stringify({ meta: { page: 1 }, data: { items: [{ a: 1 }, { a: 2, b: 'x' }] } }) + '\n',
);
w('lines.jsonl', '{"a":1}\n{"a":2,"b":"two"}\n');
w('malformed.json', '{\n  "a": 1,\n  "b": [1, 2,],\n}\n');
w(
  'sample.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<!-- catalog fixture -->
<catalog xmlns:dc="http://purl.org/dc/elements/1.1/">
  <book id="bk101" lang="en">
    <dc:title>XML Developer's Guide</dc:title>
    <price currency="USD">44.95</price>
    <tag>xml</tag>
    <tag>dev</tag>
  </book>
  <book id="bk102" lang="fr">
    <dc:title>Le Petit Prince &amp; moi</dc:title>
    <price currency="EUR">9.50</price>
    <tag>fiction</tag>
  </book>
</catalog>
`,
);
w('malformed.xml', '<root>\n  <a>1</a>\n  <b>2</c>\n</root>\n');
w(
  'entities.xml',
  '<?xml version="1.0"?>\n<!DOCTYPE lolz [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;&lol;">]>\n<lolz>&lol2;</lolz>\n',
);
w(
  'sample.yaml',
  `# Service configuration
service:
  name: checkout
  replicas: 3
  enabled: yes
  country: NO
  ports:
    - 8080
    - 8443
defaults: &defaults
  timeout: 30
worker:
  <<: *defaults
  queue: orders
`,
);
w('multi.yaml', 'a: 1\n---\na: 2\n');
w('malformed.yaml', 'service:\n  name: x\n   bad: indent\n');
w(
  'sample.md',
  `# Release notes\n\nVersion **2.4** adds _offline mode_ &amp; fixes bugs. Ünïcödé 👋.\n\n## Highlights\n\n- Works offline\n- [x] Faster start-up\n  1. nested\n\n| Platform | Status |\n|---|---|\n| Web | ✅ |\n\n\`\`\`js\nconsole.log('hi');\n\`\`\`\n\nSee [the blog](https://example.com/blog).\n`,
);
w(
  'sample.html',
  `<!doctype html><html><head><title>t</title><style>p{color:red}</style><script>alert(1)</script></head><body>
<article><h1>Welcome to the <em>new</em> site</h1>
<p>We rebuilt   everything.
Read the <a href="https://example.com/changelog">changelog</a> &amp; tell us.</p>
<ul><li>Faster pages</li><li>Better <b>search</b></li></ul>
<ol start="3"><li>three</li><li>four</li></ol>
<table><tr><th>Plan</th><th>Price</th></tr><tr><td>Free</td><td>$0</td></tr></table>
<pre>line 1
  line 2</pre>
<p hidden>hidden text</p><img src="x.png" alt="diagram"><br>Café 東京</article></body></html>
`,
);
w(
  'sample.srt',
  '1\r\n00:00:01,000 --> 00:00:03,500\r\n<i>Previously…</i> Ünïcödé 👋\r\n\r\n2\r\n00:00:04,000 --> 00:00:06,250\r\n{\\an8}We need to talk.\r\n- About what?\r\n\r\n3\r\n00:00:09,100 --> 00:00:11,000\r\n<font color="#ff0">You know</font> exactly what & why.\r\n',
);
w(
  'sample.vtt',
  'WEBVTT - fixture\n\nNOTE a comment\n\nSTYLE\n::cue { color: yellow }\n\ncue-1\n00:00:01.000 --> 00:00:03.500 line:0 align:center\n<v Narrator>Previously…\n\n00:04.000 --> 00:06.250\n<v Sam>We need to <b>talk</b> &amp; listen.\n\n00:00:06.250 --> 00:00:08.000\nWe need to talk.\nRolling line two\n\n00:00:08.000 --> 00:00:10.000\nRolling line two\nRolling line three\n',
);
w(
  'sample.ass',
  '[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,56,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,2,96,96,43,1\nStyle: Sign,Arial,40,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,8,96,96,43,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\\i1}Previously, on the show…{\\i0}\nComment: 0,0:00:02.00,0:00:03.00,Default,,0,0,0,,hidden\nDialogue: 0,0:00:04.00,0:00:06.25,Sign,,0,0,0,,{\\pos(960,100)\\c&H00FFFF&}Welcome, friends\\NSecond line\nDialogue: 0,0:00:07.00,0:00:08.00,Default,,0,0,0,,{\\k20}Ka{\\k30}ra{\\k40}oke {\\b1}bold{\\b0}\n',
);
// Windows-1252 encoded SRT (é = 0xE9, ’ = 0x92).
w(
  'cp1252.srt',
  Buffer.from([
    ...Buffer.from('1\r\n00:00:01,000 --> 00:00:02,000\r\nCaf'),
    0xe9,
    ...Buffer.from(' it'),
    0x92,
    ...Buffer.from('s open\r\n'),
  ]),
);
w('sample.base64.txt', Buffer.from('Hello, wörld! 👋\n').toString('base64') + '\n');
w('png.base64.txt', readFileSync(join(OUT, 'sample.png')).toString('base64') + '\n');
w(
  'sample.urlencoded.txt',
  'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dcaf%C3%A9%20au%20lait%26lang%3Dfr\n',
);
w('plain.txt', 'Hello, wörld! 👋 & = ? / #\n');
console.log('fixtures written to', OUT);
