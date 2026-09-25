import { CORE_SCHEMA, dump, loadAll, mergeTag, YAMLException } from 'js-yaml';
import { ConversionError, type ConversionIssue } from '../types';
import { warning } from '../shared/engine-utils';

const SCHEMA = CORE_SCHEMA.withTags(mergeTag);

export function parseYaml(text: string): { value: unknown; warnings: ConversionIssue[] } {
  const input = text.replace(/^\ufeff/, '');
  if (!input.trim()) throw new ConversionError('EMPTY_INPUT', 'The input is empty.');
  let docs: unknown[];
  try {
    docs = loadAll(input, { schema: SCHEMA, maxAliases: 1000, maxDepth: 500 });
  } catch (err) {
    if (err instanceof YAMLException) {
      const where = err.mark ? ` at line ${err.mark.line + 1}, column ${err.mark.column + 1}` : '';
      throw new ConversionError('MALFORMED_INPUT', `Invalid YAML${where}: ${err.reason}`);
    }
    throw new ConversionError(
      'MALFORMED_INPUT',
      `Invalid YAML: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  const nonEmpty = docs.filter((d) => d !== undefined);
  if (nonEmpty.length === 0)
    throw new ConversionError(
      'EMPTY_INPUT',
      'The YAML contains no data (only comments or an empty document).',
    );
  if (nonEmpty.length === 1) return { value: nonEmpty[0], warnings: [] };
  return {
    value: nonEmpty,
    warnings: [
      warning(
        `The file contains ${nonEmpty.length} YAML documents (separated by ---); they were combined into one list.`,
      ),
    ],
  };
}

export function stringifyYaml(value: unknown, indent: number): string {
  return dump(value, { indent, lineWidth: -1, noRefs: true, skipInvalid: true });
}
