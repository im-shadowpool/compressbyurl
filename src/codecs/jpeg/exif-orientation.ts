const EXIF_MARKER = 0xe1;
const ORIENTATION_TAG = 0x0112;
const TIFF_MAGIC = 42;

interface OrientationEntry {
  littleEndian: boolean;
  valueOffset: number;
  value: number;
}

function isExifHeader(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] === 0x45 &&
    bytes[offset + 1] === 0x78 &&
    bytes[offset + 2] === 0x69 &&
    bytes[offset + 3] === 0x66 &&
    bytes[offset + 4] === 0 &&
    bytes[offset + 5] === 0
  );
}

function findOrientationInTiff(
  view: DataView,
  tiffOffset: number,
  limit: number,
): OrientationEntry | null {
  if (tiffOffset + 8 > limit) return null;
  const byteOrder = view.getUint16(tiffOffset, false);
  const littleEndian = byteOrder === 0x4949;
  if (!littleEndian && byteOrder !== 0x4d4d) return null;
  if (view.getUint16(tiffOffset + 2, littleEndian) !== TIFF_MAGIC) return null;

  const directoryOffset = view.getUint32(tiffOffset + 4, littleEndian);
  const directoryStart = tiffOffset + directoryOffset;
  if (directoryStart + 2 > limit) return null;

  const entryCount = view.getUint16(directoryStart, littleEndian);
  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = directoryStart + 2 + index * 12;
    if (entryOffset + 12 > limit) return null;
    if (view.getUint16(entryOffset, littleEndian) !== ORIENTATION_TAG) continue;

    const valueOffset = entryOffset + 8;
    const value = view.getUint16(valueOffset, littleEndian);
    return {
      littleEndian,
      value: value >= 1 && value <= 8 ? value : 1,
      valueOffset,
    };
  }

  return null;
}

function findJpegOrientationEntry(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;

    const segmentLength = view.getUint16(offset, false);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) break;

    const segmentData = offset + 2;
    if (marker === EXIF_MARKER && isExifHeader(bytes, segmentData)) {
      return findOrientationInTiff(view, segmentData + 6, offset + segmentLength);
    }

    offset += segmentLength;
  }

  return null;
}

export function readJpegExifOrientation(buffer: ArrayBuffer) {
  return findJpegOrientationEntry(buffer)?.value ?? 1;
}

export function neutralizeJpegExifOrientation(buffer: ArrayBuffer) {
  const entry = findJpegOrientationEntry(buffer);
  if (!entry) return 1;
  new DataView(buffer).setUint16(entry.valueOffset, 1, entry.littleEndian);
  return entry.value;
}
