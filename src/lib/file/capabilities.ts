/**
 * Checks for browser features a tool needs, so we can explain a limitation
 * up front instead of failing mid-conversion.
 */
import type { ClientConversion } from '~/lib/catalog/types';

export interface Capability {
  ok: boolean;
  message?: string;
}

// 1×1 AVIF used to probe native decoding support.
const AVIF_PROBE =
  'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAACQAAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAsbWRhdBIACgc4AAaQENBpMhcZQmMEwAA0AACQQMkcYUuNGtYQVLH7IA==';

function probeImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export async function checkCapabilities(c: ClientConversion): Promise<Capability> {
  if (
    typeof Blob === 'undefined' ||
    typeof File === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  )
    return {
      ok: false,
      message:
        'Your browser is missing basic file APIs needed for in-browser conversion. Please update it.',
    };
  if ((c.engine === 'image' || c.engine === 'pdf') && typeof createImageBitmap === 'undefined')
    return {
      ok: false,
      message:
        'Your browser cannot process images in the page (createImageBitmap is missing). Please update to a current browser.',
    };
  if (c.from === 'avif' && !(await probeImage(AVIF_PROBE)))
    return {
      ok: false,
      message:
        'This browser cannot decode AVIF images, so they cannot be converted here. AVIF works in current Chrome, Edge, Firefox (93+) and Safari (16.4+).',
    };
  return { ok: true };
}

/** Formats a browser can show in an <img> without any decoder of ours. */
export function canPreviewNatively(mime: string, name: string): boolean {
  return (
    /^image\/(jpeg|png|gif|webp|avif|bmp|svg\+xml|x-icon|vnd\.microsoft\.icon)$/.test(mime) ||
    /\.(jpe?g|png|gif|webp|avif|bmp|svg|ico)$/i.test(name)
  );
}
