import type { StaticImageFormat } from "@/types/image";

import type { CompressionModeSettings, OutputFormat, ResizeSettings } from "./types";

const SMART_QUALITY: Readonly<Record<StaticImageFormat, number>> = {
  avif: 0.5,
  jpeg: 0.82,
  png: 1,
  webp: 0.82,
};

export function resolveOutputFormat(
  sourceFormat: StaticImageFormat,
  outputFormat: OutputFormat,
): StaticImageFormat {
  return outputFormat === "keep" ? sourceFormat : outputFormat;
}

export function resolveEncoderQuality(
  format: StaticImageFormat,
  mode: CompressionModeSettings,
) {
  if (format === "png") return 1;
  return mode.mode === "quality" ? mode.quality : SMART_QUALITY[format];
}

export function applySmartResizePolicy(
  resize: ResizeSettings,
  mode: CompressionModeSettings["mode"],
): ResizeSettings {
  if (mode !== "smart" || resize.mode === "original") return resize;
  return { ...resize, preventUpscale: true };
}
