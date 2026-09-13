export { createDefaultCompressionSettings } from "./default-settings";
export {
  createImageZip,
  type ImageZipEntry,
  type ImageZipProgress,
} from "./create-image-zip";
export {
  HUGE_IMAGE_BYTES,
  HUGE_IMAGE_PIXELS,
  LARGE_IMAGE_PIXELS,
  MAX_BATCH_CONCURRENCY,
  resolveBatchConcurrency,
  type BatchWorkloadItem,
} from "./batch-queue";
export {
  createOutputName,
  extensionForFormat,
  resolveUniqueOutputName,
  type OutputNamingContext,
} from "./naming";
export {
  COMPRESSION_PRESETS,
  findCompressionPreset,
  type CompressionPreset,
  type CompressionPresetId,
} from "./presets";
export {
  DEFAULT_FILE_TOOL_PREFERENCES,
  FILE_TOOL_SETTINGS_KEY,
  FILE_TOOL_SETTINGS_VERSION,
  loadFileToolPreferences,
  resetFileToolPreferences,
  saveFileToolPreferences,
  type FileToolPreferences,
} from "./settings-persistence";
export {
  applySmartResizePolicy,
  resolveEncoderQuality,
  resolveOutputFormat,
} from "./smart";
export {
  searchTargetSize,
  resolveNextTargetDimensions,
  SMART_TARGET_MAX_DIMENSION_STEPS,
  SMART_TARGET_MIN_EDGE,
  TARGET_SEARCH_MAX_ITERATIONS,
  TARGET_SEARCH_MAX_QUALITY,
  TARGET_SEARCH_MIN_QUALITY,
  TargetSizeUnreachableError,
  type TargetSizeCandidate,
  type TargetSizeSearchOptions,
} from "./target-size";
export {
  isValidResizeSettings,
  resolveResizeDimensions,
  resolveResizePlan,
} from "./resize";
export type { ResizePlan, ResizeStrategy } from "./resize";
export type { CompressionRunOptions, CompressionService } from "./service";
export type {
  CompressionError,
  CompressionErrorCode,
  CompressionModeSettings,
  CompressionProgress,
  CompressionRequest,
  CompressionResult,
  CompressionSettings,
  CompressionSource,
  CompressionStage,
  CompressionWarning,
  CompressionWarningCode,
  MetadataResult,
  NamingSettings,
  OutputFormat,
  ProcessingState,
  ResizeSettings,
} from "./types";
