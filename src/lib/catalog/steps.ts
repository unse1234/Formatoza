import { getOptionFields } from '~/engines/options';
import type { ConversionMeta } from './types';

function list(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/** Default "How to convert X to Y" steps derived from the tool's actual behaviour and settings. */
export function defaultSteps(c: ConversionMeta): string[] {
  const src = c.source.name;
  const dst = c.target.name;
  const exts = c.input.extensions.slice(0, 4).join(', ');
  const first = c.input.textInput
    ? `Drop your ${src} file (${exts}) onto the converter, choose it with the file picker, or switch to “Paste text” and paste the content directly.`
    : `Drop your ${src} ${c.input.multiple ? 'files' : 'file'} (${exts}) onto the converter or click to choose ${c.input.multiple ? `up to ${c.input.maxFiles} files` : 'one file'} from your device.`;

  const settings = getOptionFields(c.engine, c.from, c.to)
    .filter((f) => !f.visibleWhen)
    .map((f) => f.label.toLowerCase());
  const steps = [first];
  if (c.output.combinesInputs && c.input.multiple)
    steps.push('Check the order in the file list — use the arrow buttons to move files up or down. The output follows this order.');
  if (settings.length)
    steps.push(`Optionally open Settings to adjust ${list(settings.slice(0, 4))}. The defaults work well for most files.`);
  steps.push(`Select “Convert to ${dst}”. The conversion runs in this browser tab — nothing is uploaded — and you can cancel at any time.`);
  steps.push(
    c.output.preview === 'text' || c.output.preview === 'html'
      ? `Review the result, then copy it to your clipboard or download it as a ${c.output.extension} file.`
      : `Preview the result and download each ${dst} file, or download everything at once as a ZIP when there are several.`,
  );
  return steps;
}
