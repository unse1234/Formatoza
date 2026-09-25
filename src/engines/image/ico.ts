import { ConversionError } from '../types';

export interface IcoEntry {
  width: number;
  height: number;
  bitCount: number;
  offset: number;
  size: number;
  isPng: boolean;
}

/** Reads the ICONDIR/ICONDIRENTRY table of a .ico (or .cur) file. */
export function parseIco(bytes: Uint8Array): IcoEntry[] {
  if (bytes.length < 6) throw new ConversionError('MALFORMED_INPUT', 'The icon file is truncated.');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const reserved = dv.getUint16(0, true);
  const type = dv.getUint16(2, true);
  const count = dv.getUint16(4, true);
  if (reserved !== 0 || (type !== 1 && type !== 2))
    throw new ConversionError('MALFORMED_INPUT', 'This is not a valid .ico file.');
  if (count === 0) throw new ConversionError('EMPTY_INPUT', 'The icon file contains no images.');
  if (6 + count * 16 > bytes.length)
    throw new ConversionError('MALFORMED_INPUT', 'The icon directory is truncated.');
  const entries: IcoEntry[] = [];
  for (let i = 0; i < count; i++) {
    const p = 6 + i * 16;
    const size = dv.getUint32(p + 8, true);
    const offset = dv.getUint32(p + 12, true);
    if (offset + size > bytes.length || size < 8) continue;
    const isPng =
      bytes[offset] === 0x89 &&
      bytes[offset + 1] === 0x50 &&
      bytes[offset + 2] === 0x4e &&
      bytes[offset + 3] === 0x47;
    let width = bytes[p] || 256;
    let height = bytes[p + 1] || 256;
    if (isPng && offset + 24 <= bytes.length) {
      const pdv = new DataView(bytes.buffer, bytes.byteOffset + offset, 24);
      width = pdv.getUint32(16);
      height = pdv.getUint32(20);
    }
    entries.push({
      width,
      height,
      bitCount: dv.getUint16(p + 6, true) || (isPng ? 32 : 0),
      offset,
      size,
      isPng,
    });
  }
  if (!entries.length)
    throw new ConversionError(
      'MALFORMED_INPUT',
      'None of the images inside the icon could be read.',
    );
  return entries;
}

/** Largest entry, preferring higher bit depth on ties. */
export function largestEntry(entries: IcoEntry[]): IcoEntry {
  return [...entries].sort(
    (a, b) => b.width * b.height - a.width * a.height || b.bitCount - a.bitCount,
  )[0]!;
}
