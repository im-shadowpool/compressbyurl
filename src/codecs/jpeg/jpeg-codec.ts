import type { StaticImageFormat } from "@/types/image";

import { decodeStaticImage } from "../browser/decode-static-image";
import { preserveJpegMetadata } from "./metadata";
import {
  CodecError,
  type CodecEncodeOptions,
  type CodecEncodeResult,
  type ImageCodec,
} from "../types";

export const JPEG_FIXED_QUALITY = 0.82;

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Compression was cancelled.", "AbortError");
}

export class JpegCodec implements ImageCodec {
  readonly outputFormat = "jpeg" as const;
  readonly outputMime = "image/jpeg" as const;

  supportsInput(format: StaticImageFormat) {
    return (
      format === "jpeg" || format === "png" || format === "webp" || format === "avif"
    );
  }

  async encode(source: Blob, options: CodecEncodeOptions): Promise<CodecEncodeResult> {
    if (
      typeof createImageBitmap !== "function" ||
      typeof OffscreenCanvas === "undefined"
    ) {
      throw new CodecError(
        "ENCODER_UNAVAILABLE",
        "Browser JPEG encoding is unavailable.",
      );
    }

    const { canvas, dimensions } = await decodeStaticImage(source, {
      background: options.background ?? "#ffffff",
      resizeStrategy: options.resizeStrategy,
      signal: options.signal,
      targetDimensions: options.targetDimensions,
    });

    let blob: Blob;
    try {
      blob = await canvas.convertToBlob({
        quality: options.quality,
        type: this.outputMime,
      });
    } catch (cause) {
      throw new CodecError("ENCODE_FAILED", "The JPEG could not be encoded.", cause);
    }
    throwIfAborted(options.signal);

    if (blob.type !== this.outputMime || blob.size === 0) {
      throw new CodecError(
        "ENCODER_UNAVAILABLE",
        "This browser did not return a JPEG image.",
      );
    }

    if (options.preserveMetadata) {
      blob = await preserveJpegMetadata(source, blob);
      throwIfAborted(options.signal);
    }

    return { blob, dimensions };
  }
}
