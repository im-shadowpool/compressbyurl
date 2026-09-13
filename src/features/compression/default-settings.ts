import type { CompressionSettings } from "./types";

export function createDefaultCompressionSettings(): CompressionSettings {
  return {
    jpegBackground: "#ffffff",
    mode: "smart",
    naming: { mode: "original" },
    outputFormat: "keep",
    resize: { mode: "original", preventUpscale: true },
    stripMetadata: true,
  };
}
