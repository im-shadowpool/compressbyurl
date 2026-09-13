import type { CompressionError, CompressionErrorCode } from "@/features/compression";

export class CompressionWorkerError extends Error implements CompressionError {
  readonly code: CompressionErrorCode;
  override readonly cause?: unknown;

  constructor(error: CompressionError) {
    super(error.message, { cause: error.cause });
    this.name = "CompressionWorkerError";
    this.code = error.code;
    this.cause = error.cause;
  }
}

export function isCompressionWorkerError(
  error: unknown,
): error is CompressionWorkerError {
  return error instanceof CompressionWorkerError;
}
