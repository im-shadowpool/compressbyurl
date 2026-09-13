import type {
  ImageDimensions,
  StaticImageFormat,
  StaticImageMimeType,
} from "@/types/image";

export interface CodecEncodeOptions {
  background?: string;
  preserveMetadata?: boolean;
  quality: number;
  resizeStrategy?: "cover" | "stretch";
  signal: AbortSignal;
  targetDimensions?: ImageDimensions;
}

export interface CodecEncodeResult {
  blob: Blob;
  dimensions: ImageDimensions;
}

export interface ImageCodec {
  readonly outputFormat: StaticImageFormat;
  readonly outputMime: StaticImageMimeType;
  supportsInput(format: StaticImageFormat): boolean;
  encode(source: Blob, options: CodecEncodeOptions): Promise<CodecEncodeResult>;
}

export type CodecErrorCode = "DECODE_FAILED" | "ENCODER_UNAVAILABLE" | "ENCODE_FAILED";

export class CodecError extends Error {
  readonly code: CodecErrorCode;
  override readonly cause?: unknown;

  constructor(code: CodecErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "CodecError";
    this.code = code;
    this.cause = cause;
  }
}
