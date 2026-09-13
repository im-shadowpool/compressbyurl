import type { StaticImageFormat } from "@/types/image";

import { decodeStaticImage } from "../browser/decode-static-image";
import {
  CodecError,
  type CodecEncodeOptions,
  type CodecEncodeResult,
  type ImageCodec,
} from "../types";

export const WEBP_FIXED_QUALITY = 0.82;

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Compression was cancelled.", "AbortError");
}

export class WebpCodec implements ImageCodec {
  readonly outputFormat = "webp" as const;
  readonly outputMime = "image/webp" as const;

  supportsInput(format: StaticImageFormat) {
    return format === "jpeg" || format === "png" || format === "webp";
  }

  async encode(source: Blob, options: CodecEncodeOptions): Promise<CodecEncodeResult> {
    if (
      typeof createImageBitmap !== "function" ||
      typeof OffscreenCanvas === "undefined"
    ) {
      throw new CodecError(
        "ENCODER_UNAVAILABLE",
        "Browser WebP encoding is unavailable.",
      );
    }

    const { canvas, dimensions } = await decodeStaticImage(source, {
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
      throw new CodecError("ENCODE_FAILED", "The WebP could not be encoded.", cause);
    }
    throwIfAborted(options.signal);

    if (blob.type !== this.outputMime || blob.size === 0) {
      throw new CodecError(
        "ENCODER_UNAVAILABLE",
        "This browser did not return a WebP image.",
      );
    }

    return { blob, dimensions };
  }
}
