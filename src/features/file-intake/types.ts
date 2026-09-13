import {
  STATIC_IMAGE_MIME_TYPES,
  type StaticImageFormat,
  type StaticImageMimeType,
} from "@/types/image";

export const ACCEPTED_IMAGE_MIME_TYPES = STATIC_IMAGE_MIME_TYPES;

export const FILE_INPUT_ACCEPT = ACCEPTED_IMAGE_MIME_TYPES.join(",");

export type AcceptedImageFormat = StaticImageFormat;

export interface IntakeItemBase {
  id: string;
  file: File;
  name: string;
  size: number;
}

export interface ValidatedIntakeItem extends IntakeItemBase {
  status: "validated";
  format: AcceptedImageFormat;
  mime: StaticImageMimeType;
}

export interface ReadyIntakeItem extends IntakeItemBase {
  status: "ready";
  format: AcceptedImageFormat;
  mime: StaticImageMimeType;
  previewUrl: string;
  width: number;
  height: number;
}

export type IntakeRejectionCode =
  | "empty-file"
  | "unreadable-file"
  | "corrupt-image"
  | "format-not-accepted"
  | "unsupported-format"
  | "animated-image"
  | "type-mismatch";

export interface RejectedIntakeItem extends IntakeItemBase {
  status: "rejected";
  code: IntakeRejectionCode;
  message: string;
}

export type IntakeItem = ReadyIntakeItem | RejectedIntakeItem;
export type FileValidationResult = ValidatedIntakeItem | RejectedIntakeItem;
