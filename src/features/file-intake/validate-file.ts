import {
  type AcceptedImageFormat,
  type FileValidationResult,
  type IntakeRejectionCode,
  type RejectedIntakeItem,
} from "./types";
import { STATIC_IMAGE_MIME_BY_FORMAT } from "@/types/image";

const SIGNATURE_READ_LIMIT = 256 * 1024;

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

function detectFormat(bytes: Uint8Array): AcceptedImageFormat | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "png";
  }
  if (readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP") {
    return "webp";
  }
  if (
    readAscii(bytes, 4, 4) === "ftyp" &&
    (includesAscii(bytes.subarray(8, 64), "avif") ||
      includesAscii(bytes.subarray(8, 64), "avis"))
  ) {
    return "avif";
  }

  return null;
}

function rejection(
  file: File,
  id: string,
  code: IntakeRejectionCode,
  message: string,
): RejectedIntakeItem {
  return {
    code,
    file,
    id,
    message,
    name: file.name,
    size: file.size,
    status: "rejected",
  };
}

export async function validateImageFile(
  file: File,
  id: string,
): Promise<FileValidationResult> {
  if (file.size === 0) {
    return rejection(file, id, "empty-file", "This file is empty or unreadable.");
  }

  let bytes: Uint8Array;

  try {
    bytes = new Uint8Array(
      await file.slice(0, Math.min(file.size, SIGNATURE_READ_LIMIT)).arrayBuffer(),
    );
  } catch {
    return rejection(file, id, "unreadable-file", "This file could not be read.");
  }
  const format = detectFormat(bytes);

  if (!format) {
    return rejection(
      file,
      id,
      "unsupported-format",
      "Use a static JPEG, PNG, WebP or AVIF image.",
    );
  }

  if (
    format === "webp" &&
    (includesAscii(bytes, "ANIM") || includesAscii(bytes, "ANMF"))
  ) {
    return rejection(file, id, "animated-image", "Animated WebP is not supported.");
  }

  if (format === "avif" && includesAscii(bytes.subarray(8, 64), "avis")) {
    return rejection(file, id, "animated-image", "Animated AVIF is not supported.");
  }

  if (file.type && file.type !== STATIC_IMAGE_MIME_BY_FORMAT[format]) {
    return rejection(
      file,
      id,
      "type-mismatch",
      `The file contents do not match its declared ${file.type} type.`,
    );
  }

  return {
    file,
    format,
    id,
    mime: STATIC_IMAGE_MIME_BY_FORMAT[format],
    name: file.name,
    size: file.size,
    status: "validated",
  };
}
