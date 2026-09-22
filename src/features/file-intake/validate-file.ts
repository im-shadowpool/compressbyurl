import {
  type AcceptedImageFormat,
  type FileValidationResult,
  type IntakeRejectionCode,
  type RejectedIntakeItem,
} from "./types";
import { inspectStaticImageSignature } from "@compressbyurl/url-audit-core/image-signature";

const SIGNATURE_READ_LIMIT = 256 * 1024;

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
  const signature = inspectStaticImageSignature(bytes);

  if (!signature) {
    return rejection(
      file,
      id,
      "unsupported-format",
      "Use a static JPEG, PNG, WebP or AVIF image.",
    );
  }

  if (signature.animated) {
    return rejection(
      file,
      id,
      "animated-image",
      `Animated ${signature.format.toUpperCase()} is not supported.`,
    );
  }

  if (file.type && file.type !== signature.mimeType) {
    return rejection(
      file,
      id,
      "type-mismatch",
      `The file contents do not match its declared ${file.type} type.`,
    );
  }

  return {
    file,
    format: signature.format as AcceptedImageFormat,
    id,
    mime: signature.mimeType,
    name: file.name,
    size: file.size,
    status: "validated",
  };
}
