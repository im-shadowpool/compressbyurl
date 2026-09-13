import type { CompressionProgress, CompressionRequest, CompressionResult } from "./types";

export interface CompressionRunOptions {
  signal?: AbortSignal;
  onProgress?: (progress: CompressionProgress) => void;
}

export interface CompressionService {
  compress(
    request: CompressionRequest,
    options?: CompressionRunOptions,
  ): Promise<CompressionResult>;
}
