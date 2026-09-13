import type { StaticImageFormat } from "@/types/image";

import { decodeStaticImage } from "../browser/decode-static-image";
import {
  CodecError,
  type CodecEncodeOptions,
  type CodecEncodeResult,
  type ImageCodec,
} from "../types";

export const AVIF_FIXED_QUALITY = 0.5;

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Compression was cancelled.", "AbortError");
}

export class AvifCodec implements ImageCodec {
  readonly outputFormat = "avif" as const;
  readonly outputMime = "image/avif" as const;

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
        "Browser AVIF encoding is unavailable.",
      );
    }

    const { canvas, dimensions } = await decodeStaticImage(source, {
      resizeStrategy: options.resizeStrategy,
      signal: options.signal,
      targetDimensions: options.targetDimensions,
    });
    const context = canvas.getContext("2d");
    if (!context) {
      throw new CodecError("ENCODER_UNAVAILABLE", "AVIF pixel access is unavailable.");
    }
    const pixels = context.getImageData(0, 0, dimensions.width, dimensions.height);
    throwIfAborted(options.signal);

    let encode: typeof import("@jsquash/avif").encode;
    try {
      ({ encode } = await import("@jsquash/avif"));
    } catch (cause) {
      throw new CodecError(
        "ENCODER_UNAVAILABLE",
        "The AVIF encoder could not be loaded.",
        cause,
      );
    }

    let output: ArrayBuffer;
    try {
      output = await encode(pixels, {
        quality: Math.round(options.quality * 100),
        qualityAlpha: -1,
        speed: 8,
      });
    } catch (cause) {
      throw new CodecError(
        "ENCODE_FAILED",
        "The AVIF image could not be encoded.",
        cause,
      );
    }
    throwIfAborted(options.signal);

    const blob = new Blob([output], { type: this.outputMime });
    if (blob.size === 0) {
      throw new CodecError("ENCODE_FAILED", "The AVIF encoder returned no data.");
    }
    return { blob, dimensions };
  }
}
