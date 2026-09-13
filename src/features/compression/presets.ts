import type { OutputFormat, ResizeSettings } from "./types";

export type CompressionPresetId =
  | "custom"
  | "website-hero"
  | "blog-image"
  | "thumbnail"
  | "avatar"
  | "email"
  | "target-100"
  | "target-200"
  | "target-500"
  | "target-1024";

type PresetMode =
  | { mode: "smart" }
  | { mode: "quality"; quality: number }
  | { mode: "target-size"; targetKilobytes: 100 | 200 | 500 | 1024 };

export interface CompressionPreset {
  description: string;
  id: Exclude<CompressionPresetId, "custom">;
  label: string;
  mode: PresetMode;
  outputFormat: OutputFormat;
  resize: ResizeSettings;
}

const TARGET_PRESETS: readonly CompressionPreset[] = ([100, 200, 500, 1024] as const).map(
  (targetKilobytes) => ({
    description: `Highest tested WebP quality under ${targetKilobytes === 1024 ? "1 MB" : `${targetKilobytes} KB`}, with Smart Fit available.`,
    id: `target-${targetKilobytes}`,
    label: targetKilobytes === 1024 ? "Under 1 MB" : `Under ${targetKilobytes} KB`,
    mode: { mode: "target-size", targetKilobytes },
    outputFormat: "webp",
    resize: { mode: "original", preventUpscale: true },
  }),
);

export const COMPRESSION_PRESETS: readonly CompressionPreset[] = [
  {
    description: "Wide WebP, fitted within 1920 × 1080 for crisp landing pages.",
    id: "website-hero",
    label: "Website Hero",
    mode: { mode: "smart" },
    outputFormat: "webp",
    resize: {
      maxHeight: 1080,
      maxWidth: 1920,
      mode: "max",
      preventUpscale: true,
    },
  },
  {
    description: "Balanced WebP, fitted within 1200 × 800 for articles and guides.",
    id: "blog-image",
    label: "Blog Image",
    mode: { mode: "smart" },
    outputFormat: "webp",
    resize: {
      maxHeight: 800,
      maxWidth: 1200,
      mode: "max",
      preventUpscale: true,
    },
  },
  {
    description: "Exact 480 × 270 WebP with a centered, proportional crop.",
    id: "thumbnail",
    label: "Thumbnail",
    mode: { mode: "smart" },
    outputFormat: "webp",
    resize: {
      height: 270,
      maintainAspectRatio: true,
      mode: "exact",
      preventUpscale: true,
      width: 480,
    },
  },
  {
    description: "Exact 512 × 512 WebP with a centered, proportional crop.",
    id: "avatar",
    label: "Avatar",
    mode: { mode: "smart" },
    outputFormat: "webp",
    resize: {
      height: 512,
      maintainAspectRatio: true,
      mode: "exact",
      preventUpscale: true,
      width: 512,
    },
  },
  {
    description: "Compatible JPEG at 76% quality, fitted within 1200 × 1200.",
    id: "email",
    label: "Email",
    mode: { mode: "quality", quality: 76 },
    outputFormat: "jpeg",
    resize: {
      maxHeight: 1200,
      maxWidth: 1200,
      mode: "max",
      preventUpscale: true,
    },
  },
  ...TARGET_PRESETS,
];

export function findCompressionPreset(id: CompressionPresetId) {
  return id === "custom"
    ? undefined
    : COMPRESSION_PRESETS.find((preset) => preset.id === id);
}
