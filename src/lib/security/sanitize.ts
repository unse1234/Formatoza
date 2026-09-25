/**
 * HTML sanitisation for anything derived from user files (DOCX → HTML output,
 * Markdown/HTML previews). Never inject converted HTML without this.
 */
import DOMPurify from 'dompurify';

export interface SanitizeOptions {
  allowImages: boolean;
}

export function sanitizeHtml(html: string, o: SanitizeOptions = { allowImages: true }): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [
      'style',
      'form',
      'input',
      'button',
      'textarea',
      'select',
      'iframe',
      'object',
      'embed',
      ...(o.allowImages ? [] : ['img', 'picture', 'source']),
    ],
    FORBID_ATTR: ['style', 'srcset'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}
