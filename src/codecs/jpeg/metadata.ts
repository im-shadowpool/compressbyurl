import { neutralizeJpegExifOrientation } from "./exif-orientation";

const START_OF_IMAGE = 0xd8;
const START_OF_SCAN = 0xda;
const END_OF_IMAGE = 0xd9;
const COMMENT_MARKER = 0xfe;

function isMetadataMarker(marker: number) {
  return (marker >= 0xe1 && marker <= 0xef) || marker === COMMENT_MARKER;
}

function extractMetadataSegments(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const segments: ArrayBuffer[] = [];
  if (bytes[0] !== 0xff || bytes[1] !== START_OF_IMAGE) return segments;

  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const markerStart = offset;
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === START_OF_SCAN || marker === END_OF_IMAGE) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const segmentLength = view.getUint16(offset, false);
    const segmentEnd = offset + segmentLength;
    if (segmentLength < 2 || segmentEnd > bytes.length) break;
    if (isMetadataMarker(marker)) {
      segments.push(buffer.slice(markerStart, segmentEnd));
    }
    offset = segmentEnd;
  }
  return segments;
}

export async function preserveJpegMetadata(source: Blob, encoded: Blob) {
  const sourceBuffer = await source.arrayBuffer();
  neutralizeJpegExifOrientation(sourceBuffer);
  const segments = extractMetadataSegments(sourceBuffer);
  if (segments.length === 0) return encoded;
  return new Blob([encoded.slice(0, 2), ...segments, encoded.slice(2)], {
    type: "image/jpeg",
  });
}
