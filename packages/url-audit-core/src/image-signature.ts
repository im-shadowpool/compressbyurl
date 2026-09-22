export type StaticImageFormat = "jpeg" | "png" | "webp" | "avif";

export interface StaticImageSignature {
  animated: boolean;
  format: StaticImageFormat;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
}

const MIME_BY_FORMAT = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
} as const;

function startsWith(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function readAscii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function includesAscii(bytes: Uint8Array, value: string) {
  const signature = Array.from(value, (character) => character.charCodeAt(0));
  return bytes.some((_, start) =>
    signature.every((byte, offset) => bytes[start + offset] === byte),
  );
}

export function inspectStaticImageSignature(
  bytes: Uint8Array,
): StaticImageSignature | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { animated: false, format: "jpeg", mimeType: MIME_BY_FORMAT.jpeg };
  }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return {
      animated: includesAscii(bytes, "acTL"),
      format: "png",
      mimeType: MIME_BY_FORMAT.png,
    };
  }
  if (readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP") {
    return {
      animated: includesAscii(bytes, "ANIM") || includesAscii(bytes, "ANMF"),
      format: "webp",
      mimeType: MIME_BY_FORMAT.webp,
    };
  }
  if (readAscii(bytes, 4, 4) === "ftyp") {
    const brands = bytes.subarray(8, 64);
    if (includesAscii(brands, "avif") || includesAscii(brands, "avis")) {
      return {
        animated: includesAscii(brands, "avis"),
        format: "avif",
        mimeType: MIME_BY_FORMAT.avif,
      };
    }
  }
  return null;
}
