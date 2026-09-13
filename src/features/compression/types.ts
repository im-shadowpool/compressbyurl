import type {
  ImageDimensions,
  StaticImageFormat,
  StaticImageMimeType,
} from "@/types/image";

export type OutputFormat = "keep" | StaticImageFormat;

export type CompressionModeSettings =
  | { mode: "smart" }
  | { mode: "quality"; quality: number }
  | { mode: "target-size"; targetBytes: number; allowDimensionReduction: boolean };

export type ResizeSettings =
  | { mode: "original"; preventUpscale: true }
  | {
      mode: "max";
      maxWidth: number | null;
      maxHeight: number | null;
      preventUpscale: boolean;
    }
  | {
      mode: "exact";
      width: number;
      height: number;
      maintainAspectRatio: boolean;
      preventUpscale: boolean;
    };

export type NamingSettings =
  | { mode: "original" }
  | {
      mode: "pattern";
      pattern: string;
      prefix: string;
      suffix: string;
      startNumber: number;
      padding: number;
      letterCase: "unchanged" | "lowercase" | "uppercase";
    };

interface CompressionSettingsBase {
  outputFormat: OutputFormat;
  resize: ResizeSettings;
  naming: NamingSettings;
  stripMetadata: boolean;
  jpegBackground: string;
}

export type CompressionSettings = CompressionSettingsBase & CompressionModeSettings;

export interface CompressionSource {
  id: string;
  blob: Blob;
  name: string;
  format: StaticImageFormat;
  mime: StaticImageMimeType;
  dimensions: ImageDimensions;
  sequence?: number;
  page?: number;
}

export interface CompressionRequest {
  source: CompressionSource;
  settings: CompressionSettings;
}

export type CompressionWarningCode =
  | "METADATA_PARTIALLY_PRESERVED"
  | "COLOR_PROFILE_CHANGED"
  | "TRANSPARENCY_FLATTENED"
  | "DIMENSIONS_REDUCED"
  | "TARGET_SIZE_NOT_REACHED";

export interface CompressionWarning {
  code: CompressionWarningCode;
  message: string;
}

export type MetadataResult = "stripped" | "preserved" | "partially-preserved";

export interface CompressionResult {
  sourceId: string;
  blob: Blob;
  outputName: string;
  outputFormat: StaticImageFormat;
  outputMime: StaticImageMimeType;
  originalBytes: number;
  outputBytes: number;
  originalDimensions: ImageDimensions;
  outputDimensions: ImageDimensions;
  savedBytes: number;
  savedPercent: number;
  metadata: MetadataResult;
  warnings: CompressionWarning[];
}

export type CompressionStage =
  | "validating"
  | "decoding"
  | "normalizing-orientation"
  | "resizing"
  | "preparing-transparency"
  | "encoding"
  | "verifying";

export interface CompressionProgress {
  sourceId: string;
  stage: CompressionStage;
  percent: number;
}

export type CompressionErrorCode =
  | "INVALID_SETTINGS"
  | "UNSUPPORTED_INPUT"
  | "DECODE_FAILED"
  | "IMAGE_TOO_LARGE"
  | "ENCODER_UNAVAILABLE"
  | "ENCODE_FAILED"
  | "TARGET_UNREACHABLE"
  | "OUT_OF_MEMORY"
  | "WORKER_UNAVAILABLE"
  | "PROTOCOL_ERROR"
  | "CANCELLED"
  | "UNKNOWN";

export interface CompressionError {
  code: CompressionErrorCode;
  message: string;
  cause?: unknown;
}

export type ProcessingState =
  | { status: "idle" }
  | { status: "queued"; sourceId: string }
  | { status: "processing"; progress: CompressionProgress }
  | { status: "completed"; result: CompressionResult }
  | { status: "failed"; sourceId: string; error: CompressionError }
  | { status: "cancelled"; sourceId: string };
