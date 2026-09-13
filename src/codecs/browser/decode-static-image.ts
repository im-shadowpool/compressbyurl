import type { ImageDimensions } from "@/types/image";

import { CodecError } from "../types";
import { neutralizeJpegExifOrientation } from "../jpeg/exif-orientation";

const EXIF_READ_LIMIT = 512 * 1024;

interface DecodeOptions {
  background?: string;
  resizeStrategy?: "cover" | "stretch";
  signal: AbortSignal;
  targetDimensions?: ImageDimensions;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException("Compression was cancelled.", "AbortError");
}

function orientedDimensions(
  width: number,
  height: number,
  orientation: number,
): ImageDimensions {
  return orientation >= 5 && orientation <= 8
    ? { height: width, width: height }
    : { height, width };
}

function applyOrientationTransform(
  context: OffscreenCanvasRenderingContext2D,
  width: number,
  height: number,
  orientation: number,
) {
  switch (orientation) {
    case 2:
      context.setTransform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      context.setTransform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      context.setTransform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      context.setTransform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      context.setTransform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      context.setTransform(0, -1, -1, 0, height, width);
      break;
    case 8:
      context.setTransform(0, -1, 1, 0, 0, width);
      break;
    default:
      context.setTransform(1, 0, 0, 1, 0, 0);
  }
}

async function prepareDecodeSource(source: Blob) {
  if (source.type !== "image/jpeg") return { orientation: 1, source };
  const headerLength = Math.min(source.size, EXIF_READ_LIMIT);
  const header = await source.slice(0, headerLength).arrayBuffer();
  const orientation = neutralizeJpegExifOrientation(header);
  return {
    orientation,
    source:
      orientation === 1
        ? source
        : new Blob([header, source.slice(headerLength)], { type: source.type }),
  };
}

export async function decodeStaticImage(source: Blob, options: DecodeOptions) {
  throwIfAborted(options.signal);
  const prepared = await prepareDecodeSource(source);
  throwIfAborted(options.signal);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(prepared.source, { imageOrientation: "none" });
  } catch (cause) {
    throw new CodecError("DECODE_FAILED", "The image could not be decoded.", cause);
  }

  const dimensions = orientedDimensions(
    bitmap.width,
    bitmap.height,
    prepared.orientation,
  );
  const canvas = new OffscreenCanvas(dimensions.width, dimensions.height);
  const context = canvas.getContext("2d", { alpha: options.background === undefined });

  if (!context) {
    bitmap.close();
    throw new CodecError(
      "ENCODER_UNAVAILABLE",
      "A 2D canvas context is unavailable in this browser.",
    );
  }

  try {
    if (options.background) {
      context.fillStyle = options.background;
      context.fillRect(0, 0, dimensions.width, dimensions.height);
    }
    applyOrientationTransform(context, bitmap.width, bitmap.height, prepared.orientation);
    context.drawImage(bitmap, 0, 0);
    context.resetTransform();
  } finally {
    bitmap.close();
  }
  throwIfAborted(options.signal);

  const target = options.targetDimensions;
  if (
    !target ||
    (target.width === dimensions.width && target.height === dimensions.height)
  ) {
    return { canvas, dimensions };
  }

  const resizedCanvas = new OffscreenCanvas(target.width, target.height);
  const resizedContext = resizedCanvas.getContext("2d", { alpha: !options.background });
  if (!resizedContext) {
    throw new CodecError(
      "ENCODER_UNAVAILABLE",
      "A resize canvas is unavailable in this browser.",
    );
  }
  if (options.background) {
    resizedContext.fillStyle = options.background;
    resizedContext.fillRect(0, 0, target.width, target.height);
  }
  resizedContext.imageSmoothingEnabled = true;
  resizedContext.imageSmoothingQuality = "high";
  if (options.resizeStrategy === "cover") {
    const sourceRatio = dimensions.width / dimensions.height;
    const targetRatio = target.width / target.height;
    const sourceWidth =
      sourceRatio > targetRatio
        ? Math.round(dimensions.height * targetRatio)
        : dimensions.width;
    const sourceHeight =
      sourceRatio > targetRatio
        ? dimensions.height
        : Math.round(dimensions.width / targetRatio);
    const sourceX = Math.round((dimensions.width - sourceWidth) / 2);
    const sourceY = Math.round((dimensions.height - sourceHeight) / 2);
    resizedContext.drawImage(
      canvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      target.width,
      target.height,
    );
  } else {
    resizedContext.drawImage(canvas, 0, 0, target.width, target.height);
  }
  throwIfAborted(options.signal);
  return { canvas: resizedCanvas, dimensions: target };
}
