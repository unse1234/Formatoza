/**
 * Text decoding for user files: BOM-aware, UTF-8 first, Windows-1252 fallback
 * (the most common legacy encoding for subtitles and CSV exports).
 */
export interface DecodedText {
  text: string;
  encoding: 'utf-8' | 'utf-16le' | 'utf-16be' | 'windows-1252';
}

export function decodeText(bytes: Uint8Array): DecodedText {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
    return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: 'utf-8' };
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe)
    return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'utf-16le' };
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff)
    return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'utf-16be' };
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: 'utf-8' };
  } catch {
    return { text: new TextDecoder('windows-1252').decode(bytes), encoding: 'windows-1252' };
  }
}

export async function readText(file: Blob): Promise<DecodedText> {
  return decodeText(new Uint8Array(await file.arrayBuffer()));
}

export function textBlob(text: string, mimeType: string, bom = false): Blob {
  const type = mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml')
    ? `${mimeType};charset=utf-8`
    : mimeType;
  return new Blob(bom ? ['﻿', text] : [text], { type });
}
