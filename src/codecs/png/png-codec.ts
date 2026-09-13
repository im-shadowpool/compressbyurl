import type { StaticImageFormat } from "@/types/image";

import { decodeStaticImage } from "../browser/decode-static-image";
import {
  CodecError,
  type CodecEncodeOptions,
  type CodecEncodeResult,
  type ImageCodec,
} from "../types";

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Compression was cancelled.", "AbortError");
}

async function readDimensions(source: Blob) {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch (cause) {
    throw new CodecError("DECODE_FAILED", "The PNG image could not be decoded.", cause);
  }
  const dimensions = { height: bitmap.height, width: bitmap.width };
  bitmap.close();
  return dimensions;
}

export class PngCodec implements ImageCodec {
  readonly outputFormat = "png" as const;
  readonly outputMime = "image/png" as const;

  supportsInput(format: StaticImageFormat) {
    return (
      format === "jpeg" || format === "png" || format === "webp" || format === "avif"
    );
  }

  async encode(source: Blob, options: CodecEncodeOptions): Promise<CodecEncodeResult> {
    if (typeof createImageBitmap !== "function") {
      throw new CodecError(
        "ENCODER_UNAVAILABLE",
        "Browser PNG optimization is unavailable.",
      );
    }

    throwIfAborted(options.signal);
    const dimensions = options.targetDimensions ?? (await readDimensions(source));
    let input: ArrayBuffer | ImageData;
    if (options.targetDimensions) {
      const decoded = await decodeStaticImage(source, {
        resizeStrategy: options.resizeStrategy,
        signal: options.signal,
        targetDimensions: options.targetDimensions,
      });
      const context = decoded.canvas.getContext("2d");
      if (!context) {
        throw new CodecError("ENCODER_UNAVAILABLE", "PNG pixel access is unavailable.");
      }
      input = context.getImageData(0, 0, dimensions.width, dimensions.height);
    } else {
      input = await source.arrayBuffer();
    }
    throwIfAborted(options.signal);

    let optimise: typeof import("@jsquash/oxipng").optimise;
    try {
      ({ optimise } = await import("@jsquash/oxipng"));
    } catch (cause) {
      throw new CodecError(
        "ENCODER_UNAVAILABLE",
        "The lossless PNG optimizer could not be loaded.",
        cause,
      );
    }

    let output: ArrayBuffer;
    try {
      output = await optimise(input, {
        interlace: false,
        level: 3,
        optimiseAlpha: false,
      });
    } catch (cause) {
      throw new CodecError("ENCODE_FAILED", "The PNG could not be optimized.", cause);
    }
    throwIfAborted(options.signal);

    const blob = new Blob([output], { type: this.outputMime });
    if (blob.size === 0) {
      throw new CodecError("ENCODE_FAILED", "The PNG optimizer returned no data.");
    }
    return { blob, dimensions };
  }
}
