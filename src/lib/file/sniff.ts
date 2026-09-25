/**
 * Magic-byte detection. Extensions lie (a ".jpg" saved from the web is often
 * WebP); these checks let engines give accurate errors and pick decoders.
 */
export type SniffedType =
  | 'jpg' | 'png' | 'gif' | 'webp' | 'bmp' | 'tiff' | 'ico' | 'heic' | 'avif'
  | 'pdf' | 'zip' | 'svg' | 'unknown';

function ascii(bytes: Uint8Array, start: number, len: number): string {
  let s = '';
  for (let i = start; i < start + len && i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return s;
}

export function sniffBytes(b: Uint8Array): SniffedType {
  if (b.length < 4) return 'unknown';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && ascii(b, 1, 3) === 'PNG') return 'png';
  if (ascii(b, 0, 4) === 'GIF8') return 'gif';
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return 'webp';
  if (ascii(b, 0, 2) === 'BM') return 'bmp';
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0 && b[3] === 0x2a))
    return 'tiff';
  if (b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) return 'ico';
  if (ascii(b, 0, 5) === '%PDF-') return 'pdf';
  if (b[0] === 0x50 && b[1] === 0x4b && (b[2] === 3 || b[2] === 5 || b[2] === 7)) return 'zip';
  if (ascii(b, 4, 4) === 'ftyp') {
    const brands = ascii(b, 8, Math.min(64, b.length - 8));
    if (/avif|avis/.test(brands)) return 'avif';
    if (/heic|heix|heim|heis|hevc|hevx|mif1|msf1/.test(brands)) return 'heic';
  }
  const head = new TextDecoder('utf-8').decode(b.subarray(0, 1024)).replace(/^﻿/, '').trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) return 'svg';
  return 'unknown';
}

export async function sniffFile(file: Blob): Promise<SniffedType> {
  return sniffBytes(new Uint8Array(await file.slice(0, 1024).arrayBuffer()));
}
