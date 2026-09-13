/// <reference lib="webworker" />

import {
  AvifCodec,
  CodecError,
  JpegCodec,
  PngCodec,
  WebpCodec,
  type CodecEncodeResult,
  type ImageCodec,
} from "@/codecs";
import type {
  CompressionErrorCode,
  CompressionProgress,
  CompressionRequest,
  CompressionResult,
} from "@/features/compression";
import {
  applySmartResizePolicy,
  createOutputName,
  isValidResizeSettings,
  resolveEncoderQuality,
  resolveNextTargetDimensions,
  resolveOutputFormat,
  resolveResizePlan,
  searchTargetSize,
  SMART_TARGET_MAX_DIMENSION_STEPS,
  TargetSizeUnreachableError,
} from "@/features/compression";

import {
  isCompressionWorkerCommand,
  type CompressionWorkerResponse,
} from "./compression-protocol";

const workerScope = self as DedicatedWorkerGlobalScope;
const activeRequests = new Map<string, AbortController>();
const avifCodec = new AvifCodec();
const jpegCodec = new JpegCodec();
const pngCodec = new PngCodec();
const webpCodec = new WebpCodec();

function respond(message: CompressionWorkerResponse) {
  workerScope.postMessage(message);
}

function cancelled(requestId: string) {
  respond({ requestId, type: "cancelled" });
}

function progress(requestId: string, progressUpdate: CompressionProgress) {
  respond({ progress: progressUpdate, requestId, type: "progress" });
}

function isValidHexColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

async function verifyOutput(blob: Blob, format: "avif" | "jpeg" | "png" | "webp") {
  const signature = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  const validJpeg =
    format === "jpeg" &&
    blob.type === "image/jpeg" &&
    signature[0] === 0xff &&
    signature[1] === 0xd8 &&
    signature[2] === 0xff;
  const validWebp =
    format === "webp" &&
    blob.type === "image/webp" &&
    String.fromCharCode(...signature.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...signature.slice(8, 12)) === "WEBP";
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const validPng =
    format === "png" &&
    blob.type === "image/png" &&
    pngSignature.every((byte, index) => signature[index] === byte);
  const validAvif =
    format === "avif" &&
    blob.type === "image/avif" &&
    String.fromCharCode(...signature.slice(4, 8)) === "ftyp" &&
    String.fromCharCode(...signature.slice(8, 12)) === "avif";

  if (!validAvif && !validJpeg && !validPng && !validWebp) {
    throw new CodecError("ENCODE_FAILED", "The encoded image failed output validation.");
  }
}

function workerError(cause: unknown): { code: CompressionErrorCode; message: string } {
  if (cause instanceof TargetSizeUnreachableError) {
    return { code: "TARGET_UNREACHABLE", message: cause.message };
  }
  if (cause instanceof CodecError) return { code: cause.code, message: cause.message };
  if (cause instanceof DOMException && cause.name === "AbortError") {
    return { code: "CANCELLED", message: "Compression was cancelled." };
  }
  if (cause instanceof RangeError) {
    return { code: "OUT_OF_MEMORY", message: "The browser ran out of image memory." };
  }
  return {
    code: "UNKNOWN",
    message:
      cause instanceof Error ? cause.message : "The worker could not process this image.",
  };
}

interface EncodePlan {
  codec: ImageCodec;
  extension: "avif" | "jpg" | "png" | "webp";
  format: "avif" | "jpeg" | "png" | "webp";
  mime: "image/avif" | "image/jpeg" | "image/png" | "image/webp";
  quality: number;
}

function createEncodePlan(request: CompressionRequest): EncodePlan {
  const requestedFormat = resolveOutputFormat(
    request.source.format,
    request.settings.outputFormat,
  );
  const quality = resolveEncoderQuality(requestedFormat, request.settings);

  if (requestedFormat === "avif" && avifCodec.supportsInput(request.source.format)) {
    return {
      codec: avifCodec,
      extension: "avif",
      format: "avif",
      mime: "image/avif",
      quality,
    };
  }

  if (requestedFormat === "jpeg" && jpegCodec.supportsInput(request.source.format)) {
    return {
      codec: jpegCodec,
      extension: "jpg",
      format: "jpeg",
      mime: "image/jpeg",
      quality,
    };
  }

  if (requestedFormat === "webp" && webpCodec.supportsInput(request.source.format)) {
    return {
      codec: webpCodec,
      extension: "webp",
      format: "webp",
      mime: "image/webp",
      quality,
    };
  }

  if (requestedFormat === "png" && pngCodec.supportsInput(request.source.format)) {
    return {
      codec: pngCodec,
      extension: "png",
      format: "png",
      mime: "image/png",
      quality,
    };
  }

  throw new CodecError(
    "ENCODER_UNAVAILABLE",
    "The requested input and output format combination is not available yet.",
  );
}

async function handleCompression(
  requestId: string,
  request: CompressionRequest,
  signal: AbortSignal,
) {
  try {
    progress(requestId, {
      percent: 5,
      sourceId: request.source.id,
      stage: "validating",
    });

    if (!isValidResizeSettings(request.settings.resize)) {
      respond({
        error: {
          code: "INVALID_SETTINGS",
          message: "Enter image dimensions from 1 to 32,768 pixels.",
        },
        requestId,
        type: "failed",
      });
      return;
    }

    if (!isValidHexColor(request.settings.jpegBackground)) {
      respond({
        error: {
          code: "INVALID_SETTINGS",
          message: "Choose a valid six-digit JPEG background color.",
        },
        requestId,
        type: "failed",
      });
      return;
    }

    if (
      request.settings.mode === "quality" &&
      (!Number.isFinite(request.settings.quality) ||
        request.settings.quality <= 0 ||
        request.settings.quality > 1)
    ) {
      respond({
        error: {
          code: "INVALID_SETTINGS",
          message: "Choose a compression quality from 1 to 100.",
        },
        requestId,
        type: "failed",
      });
      return;
    }

    if (
      request.settings.mode === "target-size" &&
      (!Number.isSafeInteger(request.settings.targetBytes) ||
        request.settings.targetBytes < 1)
    ) {
      respond({
        error: {
          code: "INVALID_SETTINGS",
          message: "Choose a target file size greater than zero.",
        },
        requestId,
        type: "failed",
      });
      return;
    }

    const plan = createEncodePlan(request);
    const resizePlan = resolveResizePlan(
      request.source.dimensions,
      applySmartResizePolicy(request.settings.resize, request.settings.mode),
    );
    const targetDimensions = resizePlan.dimensions;

    if (signal.aborted) {
      cancelled(requestId);
      return;
    }

    progress(requestId, {
      percent: 20,
      sourceId: request.source.id,
      stage: "decoding",
    });
    progress(requestId, {
      percent: 40,
      sourceId: request.source.id,
      stage:
        targetDimensions.width !== request.source.dimensions.width ||
        targetDimensions.height !== request.source.dimensions.height
          ? "resizing"
          : "encoding",
    });
    progress(requestId, {
      percent: 50,
      sourceId: request.source.id,
      stage: "encoding",
    });
    const encodeAtQuality = async (quality: number, dimensions = targetDimensions) =>
      plan.codec.encode(request.source.blob, {
        background: plan.format === "jpeg" ? request.settings.jpegBackground : undefined,
        quality,
        preserveMetadata:
          !request.settings.stripMetadata &&
          plan.format === "jpeg" &&
          request.source.format === "jpeg",
        resizeStrategy: resizePlan.strategy,
        signal,
        targetDimensions: dimensions,
      });
    const encodeForTarget = async (dimensions = targetDimensions) => {
      if (request.settings.mode !== "target-size") {
        throw new CodecError("ENCODE_FAILED", "Target-size settings are unavailable.");
      }
      if (plan.format === "png") {
        const pngResult = await encodeAtQuality(1, dimensions);
        if (pngResult.blob.size > request.settings.targetBytes) {
          throw new TargetSizeUnreachableError(pngResult.blob.size);
        }
        return pngResult;
      }

      const candidate = await searchTargetSize({
        encode: async (quality, iteration) => {
          progress(requestId, {
            percent: Math.min(85, 50 + iteration * 5),
            sourceId: request.source.id,
            stage: "encoding",
          });
          const value = await encodeAtQuality(quality, dimensions);
          return { bytes: value.blob.size, quality, value };
        },
        targetBytes: request.settings.targetBytes,
      });
      return candidate.value;
    };
    let encoded: CodecEncodeResult;
    let dimensionsReduced = false;
    if (request.settings.mode === "target-size") {
      try {
        encoded = await encodeForTarget();
      } catch (cause) {
        if (
          !(cause instanceof TargetSizeUnreachableError) ||
          !request.settings.allowDimensionReduction ||
          !cause.minimumBytes
        ) {
          throw cause;
        }

        let currentDimensions = targetDimensions;
        let currentBytes = cause.minimumBytes;
        let reducedResult: CodecEncodeResult | null = null;
        for (
          let step = 0;
          step < SMART_TARGET_MAX_DIMENSION_STEPS && !reducedResult;
          step += 1
        ) {
          const nextDimensions = resolveNextTargetDimensions(
            currentDimensions,
            request.settings.targetBytes,
            currentBytes,
          );
          if (!nextDimensions) break;
          progress(requestId, {
            percent: 45,
            sourceId: request.source.id,
            stage: "resizing",
          });
          try {
            reducedResult = await encodeForTarget(nextDimensions);
          } catch (nextCause) {
            if (
              !(nextCause instanceof TargetSizeUnreachableError) ||
              !nextCause.minimumBytes
            ) {
              throw nextCause;
            }
            currentBytes = nextCause.minimumBytes;
            currentDimensions = nextDimensions;
          }
        }
        if (!reducedResult) throw new TargetSizeUnreachableError(currentBytes);
        encoded = reducedResult;
        dimensionsReduced = true;
      }
    } else {
      encoded = await encodeAtQuality(plan.quality);
    }

    progress(requestId, {
      percent: 88,
      sourceId: request.source.id,
      stage: "verifying",
    });
    await verifyOutput(encoded.blob, plan.format);

    if (signal.aborted) {
      cancelled(requestId);
      return;
    }

    const originalBytes = request.source.blob.size;
    const savedBytes = originalBytes - encoded.blob.size;
    const result: CompressionResult = {
      blob: encoded.blob,
      metadata: request.settings.stripMetadata
        ? "stripped"
        : plan.format === "jpeg" && request.source.format === "jpeg"
          ? "preserved"
          : "partially-preserved",
      originalBytes,
      originalDimensions: request.source.dimensions,
      outputBytes: encoded.blob.size,
      outputDimensions: encoded.dimensions,
      outputFormat: plan.format,
      outputMime: plan.mime,
      outputName: createOutputName(
        request.source.name,
        plan.format,
        request.settings.naming,
        {
          dimensions: encoded.dimensions,
          page: request.source.page,
          sequence: request.source.sequence,
        },
      ),
      savedBytes,
      savedPercent: originalBytes === 0 ? 0 : (savedBytes / originalBytes) * 100,
      sourceId: request.source.id,
      warnings: [
        ...(plan.format === "jpeg" && request.source.format !== "jpeg"
          ? [
              {
                code: "TRANSPARENCY_FLATTENED" as const,
                message: `Transparent pixels, when present, were filled with ${request.settings.jpegBackground.toUpperCase()}.`,
              },
            ]
          : []),
        ...(dimensionsReduced
          ? [
              {
                code: "DIMENSIONS_REDUCED" as const,
                message: `Dimensions were reduced to ${encoded.dimensions.width} × ${encoded.dimensions.height} px to meet the target.`,
              },
            ]
          : []),
        ...(!request.settings.stripMetadata &&
        !(plan.format === "jpeg" && request.source.format === "jpeg")
          ? [
              {
                code: "METADATA_PARTIALLY_PRESERVED" as const,
                message:
                  "This format path cannot preserve every original metadata field.",
              },
            ]
          : []),
      ],
    };

    progress(requestId, {
      percent: 100,
      sourceId: request.source.id,
      stage: "verifying",
    });
    respond({ requestId, result, type: "completed" });
  } catch (cause) {
    const error = workerError(cause);
    if (error.code === "CANCELLED" || signal.aborted) {
      cancelled(requestId);
      return;
    }
    respond({ error, requestId, type: "failed" });
  } finally {
    activeRequests.delete(requestId);
  }
}

workerScope.addEventListener("message", (event: MessageEvent<unknown>) => {
  if (!isCompressionWorkerCommand(event.data)) return;

  if (event.data.type === "ping") {
    respond({ requestId: event.data.requestId, type: "pong" });
    return;
  }

  if (event.data.type === "cancel") {
    const activeRequest = activeRequests.get(event.data.requestId);
    if (activeRequest) activeRequest.abort();
    else cancelled(event.data.requestId);
    return;
  }

  const controller = new AbortController();
  activeRequests.set(event.data.requestId, controller);
  void handleCompression(event.data.requestId, event.data.request, controller.signal);
});

respond({ type: "ready" });

export {};
