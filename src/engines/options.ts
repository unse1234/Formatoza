/**
 * Declarative settings per conversion. Lightweight (no libraries) so the
 * SettingsPanel can render before the engine chunk is downloaded, and so the
 * catalog can describe settings in the static "How to" steps.
 */
import type { EngineId, FormatId } from '~/lib/catalog/types';

interface BaseField {
  key: string;
  label: string;
  help?: string;
  /** Only show when another option has one of these values. */
  visibleWhen?: { key: string; oneOf: (string | number | boolean)[] };
}
export interface SelectField extends BaseField {
  type: 'select';
  choices: { value: string; label: string }[];
  default: string;
}
export interface RangeField extends BaseField {
  type: 'range';
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}
export interface NumberField extends BaseField {
  type: 'number';
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
}
export interface BooleanField extends BaseField {
  type: 'boolean';
  default: boolean;
}
export interface TextField extends BaseField {
  type: 'text';
  default: string;
  maxLength: number;
  placeholder?: string;
}
export interface ColorField extends BaseField {
  type: 'color';
  default: string;
}
export type OptionField = SelectField | RangeField | NumberField | BooleanField | TextField | ColorField;
export type OptionValue = string | number | boolean;
export type OptionValues = Record<string, OptionValue>;

const quality = (def: number, help?: string): RangeField => ({
  key: 'quality',
  label: 'Quality',
  type: 'range',
  min: 40,
  max: 100,
  step: 1,
  default: def,
  unit: '%',
  help: help ?? 'Higher keeps more detail and makes larger files. 85–92 is visually lossless for most photos.',
});

const background: ColorField = {
  key: 'background',
  label: 'Background for transparent areas',
  type: 'color',
  default: '#ffffff',
  help: 'JPG has no transparency, so transparent pixels are filled with this color.',
};

const resize: SelectField = {
  key: 'maxSide',
  label: 'Size',
  type: 'select',
  choices: [
    { value: '0', label: 'Keep original size' },
    { value: '3840', label: 'Longest side 3840 px (4K)' },
    { value: '2560', label: 'Longest side 2560 px' },
    { value: '1920', label: 'Longest side 1920 px' },
    { value: '1280', label: 'Longest side 1280 px' },
  ],
  default: '0',
  help: 'Images are only ever scaled down, never up.',
};

const indent = (def = '2'): SelectField => ({
  key: 'indent',
  label: 'Indentation',
  type: 'select',
  choices: [
    { value: '2', label: '2 spaces' },
    { value: '4', label: '4 spaces' },
    { value: 'tab', label: 'Tab' },
    { value: '0', label: 'Minified (one line)' },
  ],
  default: def,
});

const offset: NumberField = {
  key: 'offsetMs',
  label: 'Shift all timings',
  type: 'number',
  min: -3_600_000,
  max: 3_600_000,
  step: 100,
  default: 0,
  unit: 'ms',
  help: 'Positive values delay subtitles, negative values show them earlier.',
};

function imageFields(from: FormatId, to: FormatId): OptionField[] {
  const fields: OptionField[] = [];
  if (from === 'svg') {
    fields.push(
      {
        key: 'svgScale',
        label: 'Render size',
        type: 'select',
        choices: [
          { value: '1', label: '1× (the SVG’s own size)' },
          { value: '2', label: '2× (retina)' },
          { value: '4', label: '4×' },
          { value: 'width', label: 'Custom width' },
        ],
        default: '2',
        help: 'Vectors are re-drawn at this size, so larger outputs stay sharp.',
      },
      {
        key: 'svgWidth',
        label: 'Width',
        type: 'number',
        min: 16,
        max: 8192,
        step: 1,
        default: 1024,
        unit: 'px',
        visibleWhen: { key: 'svgScale', oneOf: ['width'] },
      },
    );
  } else {
    fields.push(resize);
  }
  if (from === 'ico')
    fields.push({
      key: 'icoEntries',
      label: 'Icon sizes',
      type: 'select',
      choices: [
        { value: 'largest', label: 'Largest image only' },
        { value: 'all', label: 'Every size in the file' },
      ],
      default: 'largest',
    });
  if (from === 'tiff')
    fields.push({
      key: 'tiffPages',
      label: 'Pages',
      type: 'select',
      choices: [
        { value: 'all', label: 'Every page (one image per page)' },
        { value: 'first', label: 'First page only' },
      ],
      default: 'all',
    });
  if (to === 'jpg') fields.push(quality(90), background);
  if (to === 'webp')
    fields.push(quality(85, 'WebP at 80–90 is typically much smaller than JPG at similar visual quality.'));
  return fields;
}

function pdfFields(from: FormatId, to: FormatId): OptionField[] {
  if (to === 'pdf') {
    const f: OptionField[] = [
      {
        key: 'pageSize',
        label: 'Page size',
        type: 'select',
        choices: [
          { value: 'fit', label: 'Fit each page to its image' },
          { value: 'a4', label: 'A4 (210 × 297 mm)' },
          { value: 'letter', label: 'US Letter (8.5 × 11 in)' },
        ],
        default: 'fit',
      },
      {
        key: 'orientation',
        label: 'Orientation',
        type: 'select',
        choices: [
          { value: 'auto', label: 'Automatic (match each image)' },
          { value: 'portrait', label: 'Portrait' },
          { value: 'landscape', label: 'Landscape' },
        ],
        default: 'auto',
        visibleWhen: { key: 'pageSize', oneOf: ['a4', 'letter'] },
      },
      {
        key: 'margin',
        label: 'Margin',
        type: 'select',
        choices: [
          { value: '0', label: 'None' },
          { value: '18', label: 'Small (¼ in / 6 mm)' },
          { value: '36', label: 'Normal (½ in / 13 mm)' },
        ],
        default: '0',
      },
    ];
    if (from === 'webp' || from === 'heic')
      f.push(quality(92, 'These images are re-encoded as JPEG inside the PDF (PDF has no WebP/HEIC support).'));
    return f;
  }
  if (to === 'txt')
    return [
      { key: 'pageBreaks', label: 'Mark page breaks', type: 'boolean', default: true, help: 'Adds a “— Page N —” line between pages.' },
    ];
  const f: OptionField[] = [
    {
      key: 'dpi',
      label: 'Resolution',
      type: 'select',
      choices: [
        { value: '72', label: '72 DPI — screen preview' },
        { value: '150', label: '150 DPI — sharp on screen' },
        { value: '300', label: '300 DPI — print quality' },
      ],
      default: '150',
    },
    {
      key: 'pages',
      label: 'Pages',
      type: 'text',
      default: '',
      maxLength: 200,
      placeholder: 'All pages — or e.g. 1-3, 5, 8-',
      help: 'Leave empty for every page.',
    },
  ];
  if (to === 'jpg') f.push(quality(90));
  if (to === 'webp') f.push(quality(85));
  return f;
}

function dataFields(from: FormatId, to: FormatId): OptionField[] {
  const f: OptionField[] = [];
  if (from === 'csv')
    f.push({
      key: 'delimiter',
      label: 'Input delimiter',
      type: 'select',
      choices: [
        { value: 'auto', label: 'Detect automatically' },
        { value: ',', label: 'Comma ,' },
        { value: ';', label: 'Semicolon ;' },
        { value: '|', label: 'Pipe |' },
        { value: '\t', label: 'Tab' },
      ],
      default: 'auto',
    });
  if (from === 'csv' || from === 'tsv') {
    f.push({ key: 'header', label: 'First row contains column names', type: 'boolean', default: true });
    if (to !== 'csv' && to !== 'tsv')
      f.push({
        key: 'typed',
        label: 'Detect numbers and true/false',
        type: 'boolean',
        default: true,
        help: 'Only converts when lossless: 42 → number, but 007 and +44… stay text.',
      });
  }
  if ((from === 'csv' || from === 'tsv') && (to === 'json' || to === 'yaml' || to === 'xml'))
    f.push({
      key: 'unflatten',
      label: 'Nest dotted column names',
      type: 'boolean',
      default: false,
      help: 'A column named address.city becomes { "address": { "city": … } }.',
    });
  if ((from === 'json' || from === 'xml' || from === 'yaml') && (to === 'csv' || to === 'tsv' || to === 'xlsx'))
    f.push({
      key: 'flatten',
      label: 'Flatten nested objects into columns',
      type: 'boolean',
      default: true,
      help: 'Nested keys become columns like address.city. Off: nested values are written as JSON text.',
    });
  if (from === 'xml')
    f.push({
      key: 'attributePrefix',
      label: 'Attribute prefix',
      type: 'select',
      choices: [
        { value: '@', label: '@name' },
        { value: '_', label: '_name' },
        { value: '', label: 'none (name)' },
      ],
      default: '@',
      help: 'How XML attributes are distinguished from child elements.',
    });
  if (to === 'csv')
    f.push(
      {
        key: 'outDelimiter',
        label: 'Output delimiter',
        type: 'select',
        choices: [
          { value: ',', label: 'Comma , (standard)' },
          { value: ';', label: 'Semicolon ; (European Excel)' },
        ],
        default: ',',
      },
      {
        key: 'bom',
        label: 'Add UTF-8 BOM for Excel',
        type: 'boolean',
        default: false,
        help: 'Helps older Excel versions show accented characters correctly.',
      },
    );
  if (to === 'csv' || to === 'tsv' || to === 'xlsx')
    f.push({
      key: 'escapeFormulas',
      label: 'Neutralise spreadsheet formulas',
      type: 'boolean',
      default: false,
      help: 'Prefixes values starting with = + - @ with an apostrophe so spreadsheets don’t execute them.',
    });
  if (to === 'json') f.push(indent('2'));
  if (to === 'yaml') f.push({ ...indent('2'), choices: indent().choices.filter((c) => c.value === '2' || c.value === '4') });
  if (to === 'xml') {
    f.push(
      { key: 'rootName', label: 'Root element name', type: 'text', default: from === 'csv' || from === 'tsv' ? 'rows' : 'root', maxLength: 60 },
      { key: 'itemName', label: 'Record / list item element name', type: 'text', default: from === 'csv' || from === 'tsv' ? 'row' : 'item', maxLength: 60 },
      { ...indent('2'), choices: indent().choices.filter((c) => c.value !== 'tab') },
    );
  }
  if (to === 'xlsx')
    f.push(
      {
        key: 'combine',
        label: 'Several files',
        type: 'select',
        choices: [
          { value: 'sheets', label: 'One workbook, one sheet per file' },
          { value: 'files', label: 'One workbook per file' },
        ],
        default: 'sheets',
      },
      { key: 'styleHeader', label: 'Bold and freeze the header row', type: 'boolean', default: true },
    );
  return f;
}

function textFields(from: FormatId, to: FormatId): OptionField[] {
  const key = `${from}>${to}`;
  switch (key) {
    case 'markdown>html':
      return [
        { key: 'gfm', label: 'GitHub Flavored Markdown (tables, task lists, strikethrough)', type: 'boolean', default: true },
        { key: 'breaks', label: 'Single line breaks become <br>', type: 'boolean', default: false },
        { key: 'fullDocument', label: 'Wrap in a complete HTML document', type: 'boolean', default: false },
      ];
    case 'html>markdown':
      return [
        {
          key: 'headingStyle',
          label: 'Heading style',
          type: 'select',
          choices: [
            { value: 'atx', label: '# Heading' },
            { value: 'setext', label: 'Underlined (===)' },
          ],
          default: 'atx',
        },
        {
          key: 'bullet',
          label: 'List bullet',
          type: 'select',
          choices: [
            { value: '-', label: '- item' },
            { value: '*', label: '* item' },
          ],
          default: '-',
        },
      ];
    case 'html>txt':
      return [
        { key: 'keepLinks', label: 'Keep link URLs in parentheses', type: 'boolean', default: false },
        { key: 'keepImagesAlt', label: 'Keep image descriptions (alt text)', type: 'boolean', default: false },
      ];
    case 'markdown>txt':
      return [{ key: 'keepLinks', label: 'Keep link URLs in parentheses', type: 'boolean', default: false }];
    case 'txt>base64':
      return [
        { key: 'urlSafe', label: 'URL-safe alphabet (- and _ , no padding)', type: 'boolean', default: false },
        { key: 'wrap', label: 'Wrap lines at 76 characters (MIME)', type: 'boolean', default: false },
      ];
    case 'json>base64':
      return [
        { key: 'minify', label: 'Minify JSON before encoding', type: 'boolean', default: true },
        { key: 'urlSafe', label: 'URL-safe alphabet (- and _ , no padding)', type: 'boolean', default: false },
      ];
    case 'base64>json':
      return [indent('2')];
    case 'txt>urlencoded':
      return [
        {
          key: 'mode',
          label: 'What are you encoding?',
          type: 'select',
          choices: [
            { value: 'component', label: 'A value (query parameter, path segment)' },
            { value: 'uri', label: 'A whole URL (keep : / ? & = #)' },
          ],
          default: 'component',
        },
        { key: 'spacePlus', label: 'Encode spaces as + (HTML form style)', type: 'boolean', default: false },
        { key: 'perLine', label: 'Encode each line separately', type: 'boolean', default: false },
      ];
    case 'urlencoded>txt':
      return [
        { key: 'plusAsSpace', label: 'Treat + as a space', type: 'boolean', default: true },
        { key: 'repeat', label: 'Decode repeatedly until stable (fixes %2520)', type: 'boolean', default: false },
      ];
    default:
      return [];
  }
}

function subtitleFields(from: FormatId, to: FormatId): OptionField[] {
  if (to === 'txt')
    return [
      { key: 'timestamps', label: 'Keep timestamps', type: 'boolean', default: false },
      {
        key: 'paragraphs',
        label: 'Join lines into paragraphs',
        type: 'boolean',
        default: true,
        visibleWhen: { key: 'timestamps', oneOf: [false] },
      },
      ...(from === 'vtt'
        ? [
            {
              key: 'dedupe',
              label: 'Remove repeated rolling lines (auto-captions)',
              type: 'boolean',
              default: true,
            } satisfies BooleanField,
          ]
        : []),
    ];
  const f: OptionField[] = [offset];
  if (to === 'ass')
    f.push(
      { key: 'fontName', label: 'Font', type: 'text', default: 'Arial', maxLength: 60 },
      { key: 'fontSize', label: 'Font size', type: 'number', min: 8, max: 200, step: 1, default: 56, unit: 'px' },
      {
        key: 'resolution',
        label: 'Script resolution (PlayRes)',
        type: 'select',
        choices: [
          { value: '1920x1080', label: '1920 × 1080' },
          { value: '1280x720', label: '1280 × 720' },
          { value: '3840x2160', label: '3840 × 2160' },
        ],
        default: '1920x1080',
      },
    );
  return f;
}

function documentFields(_from: FormatId, to: FormatId): OptionField[] {
  if (to === 'html')
    return [
      {
        key: 'images',
        label: 'Images',
        type: 'select',
        choices: [
          { value: 'embed', label: 'Embed inside the HTML' },
          { value: 'omit', label: 'Leave images out' },
        ],
        default: 'embed',
      },
      { key: 'fullDocument', label: 'Wrap in a complete HTML document', type: 'boolean', default: true },
    ];
  return [];
}

export function getOptionFields(engine: EngineId, from: FormatId, to: FormatId): OptionField[] {
  switch (engine) {
    case 'image':
      return imageFields(from, to);
    case 'pdf':
      return pdfFields(from, to);
    case 'data':
      return dataFields(from, to);
    case 'text':
      return textFields(from, to);
    case 'subtitles':
      return subtitleFields(from, to);
    case 'document':
      return documentFields(from, to);
  }
}

export function defaultOptionValues(fields: OptionField[]): OptionValues {
  return Object.fromEntries(fields.map((f) => [f.key, f.default]));
}

/**
 * Coerces untrusted option input into valid values: unknown keys dropped,
 * numbers clamped, select values checked, colors validated.
 */
export function resolveOptions(fields: OptionField[], raw: Partial<OptionValues> | undefined): OptionValues {
  const out: OptionValues = {};
  for (const f of fields) {
    const v = raw?.[f.key];
    switch (f.type) {
      case 'select':
        out[f.key] = typeof v === 'string' && f.choices.some((c) => c.value === v) ? v : f.default;
        break;
      case 'range':
      case 'number': {
        const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
        out[f.key] = Number.isFinite(n) ? Math.min(f.max, Math.max(f.min, n)) : f.default;
        break;
      }
      case 'boolean':
        out[f.key] = typeof v === 'boolean' ? v : f.default;
        break;
      case 'text':
        out[f.key] = typeof v === 'string' ? v.slice(0, f.maxLength) : f.default;
        break;
      case 'color':
        out[f.key] = typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : f.default;
        break;
    }
  }
  return out;
}

export function isFieldVisible(field: OptionField, values: OptionValues): boolean {
  if (!field.visibleWhen) return true;
  return field.visibleWhen.oneOf.includes(values[field.visibleWhen.key] as string | number | boolean);
}
