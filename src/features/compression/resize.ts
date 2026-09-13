import type { ImageDimensions } from "@/types/image";

import type { ResizeSettings } from "./types";

export type ResizeStrategy = "cover" | "stretch";

export interface ResizePlan {
  dimensions: ImageDimensions;
  strategy: ResizeStrategy;
}

function isDimension(value: number | null) {
  return value === null || (Number.isInteger(value) && value >= 1 && value <= 32_768);
}

export function isValidResizeSettings(settings: ResizeSettings) {
  if (settings.mode === "original") return true;
  if (settings.mode === "max") {
    return (
      isDimension(settings.maxWidth) &&
      isDimension(settings.maxHeight) &&
      (settings.maxWidth !== null || settings.maxHeight !== null)
    );
  }
  return isDimension(settings.width) && isDimension(settings.height);
}

function fitWithin(
  original: ImageDimensions,
  maxWidth: number | null,
  maxHeight: number | null,
  preventUpscale: boolean,
) {
  const widthScale = maxWidth ? maxWidth / original.width : Infinity;
  const heightScale = maxHeight ? maxHeight / original.height : Infinity;
  const scale = Math.min(widthScale, heightScale, preventUpscale ? 1 : Infinity);

  if (!Number.isFinite(scale) || scale >= 1) return original;
  return {
    height: Math.max(1, Math.round(original.height * scale)),
    width: Math.max(1, Math.round(original.width * scale)),
  };
}

export function resolveResizePlan(
  original: ImageDimensions,
  settings: ResizeSettings,
): ResizePlan {
  if (settings.mode === "max") {
    return {
      dimensions: fitWithin(
        original,
        settings.maxWidth,
        settings.maxHeight,
        settings.preventUpscale,
      ),
      strategy: "stretch",
    };
  }

  if (settings.mode === "exact") {
    const requested = { height: settings.height, width: settings.width };
    if (!settings.preventUpscale) {
      return {
        dimensions: requested,
        strategy: settings.maintainAspectRatio ? "cover" : "stretch",
      };
    }

    if (settings.maintainAspectRatio) {
      const scale = Math.min(
        1,
        original.width / requested.width,
        original.height / requested.height,
      );
      return {
        dimensions: {
          height: Math.max(1, Math.round(requested.height * scale)),
          width: Math.max(1, Math.round(requested.width * scale)),
        },
        strategy: "cover",
      };
    }

    return {
      dimensions: {
        height: Math.min(requested.height, original.height),
        width: Math.min(requested.width, original.width),
      },
      strategy: "stretch",
    };
  }

  return { dimensions: original, strategy: "stretch" };
}

export function resolveResizeDimensions(
  original: ImageDimensions,
  settings: ResizeSettings,
): ImageDimensions {
  return resolveResizePlan(original, settings).dimensions;
}
