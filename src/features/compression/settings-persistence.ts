import { z } from "zod";

import type { CompressionPresetId } from "./presets";
import type { OutputFormat } from "./types";

export const FILE_TOOL_SETTINGS_KEY = "compress-by-url:file-tool-settings";
export const FILE_TOOL_SETTINGS_VERSION = 1;

const presetIds = [
  "custom",
  "website-hero",
  "blog-image",
  "thumbnail",
  "avatar",
  "email",
  "target-100",
  "target-200",
  "target-500",
  "target-1024",
] as const satisfies readonly CompressionPresetId[];

const outputFormats = [
  "keep",
  "jpeg",
  "png",
  "webp",
  "avif",
] as const satisfies readonly OutputFormat[];

const fileToolPreferencesSchema = z
  .object({
    activePreset: z.enum(presetIds),
    allowDimensionReduction: z.boolean(),
    compressionMode: z.enum(["smart", "quality", "target-size"]),
    customNaming: z.boolean(),
    customTarget: z.string().max(16),
    customTargetUnit: z.enum(["kb", "mb"]),
    jpegBackground: z.string().regex(/^#[0-9a-f]{6}$/i),
    maxHeight: z.string().max(5),
    maxWidth: z.string().max(5),
    nameCase: z.enum(["lowercase", "unchanged", "uppercase"]),
    namePattern: z.string().max(120),
    namePrefix: z.string().max(40),
    nameSuffix: z.string().max(40),
    outputFormat: z.enum(outputFormats),
    preserveAspectRatio: z.boolean(),
    quality: z.number().int().min(1).max(100),
    resizeEnabled: z.boolean(),
    resizeMode: z.enum(["exact", "max"]),
    sequencePadding: z.string().max(1),
    sequenceStart: z.string().max(6),
    stripMetadata: z.boolean(),
    targetPreset: z.enum(["100", "200", "500", "1024", "custom"]),
    version: z.literal(FILE_TOOL_SETTINGS_VERSION),
  })
  .strict();

export type FileToolPreferences = z.infer<typeof fileToolPreferencesSchema>;

export const DEFAULT_FILE_TOOL_PREFERENCES: FileToolPreferences = {
  activePreset: "custom",
  allowDimensionReduction: false,
  compressionMode: "smart",
  customNaming: false,
  customTarget: "250",
  customTargetUnit: "kb",
  jpegBackground: "#ffffff",
  maxHeight: "1080",
  maxWidth: "1920",
  nameCase: "unchanged",
  namePattern: "{name}",
  namePrefix: "",
  nameSuffix: "-compressed",
  outputFormat: "keep",
  preserveAspectRatio: true,
  quality: 82,
  resizeEnabled: false,
  resizeMode: "max",
  sequencePadding: "2",
  sequenceStart: "1",
  stripMetadata: true,
  targetPreset: "100",
  version: FILE_TOOL_SETTINGS_VERSION,
};

const legacySettingsSchema = z
  .object({
    outputFormat: z.enum(outputFormats).optional(),
    quality: z.number().int().min(1).max(100).optional(),
    version: z.literal(0).optional(),
  })
  .passthrough();

function migrateSettings(value: unknown): FileToolPreferences | null {
  const legacy = legacySettingsSchema.safeParse(value);
  if (!legacy.success) return null;
  return {
    ...DEFAULT_FILE_TOOL_PREFERENCES,
    outputFormat: legacy.data.outputFormat ?? DEFAULT_FILE_TOOL_PREFERENCES.outputFormat,
    quality: legacy.data.quality ?? DEFAULT_FILE_TOOL_PREFERENCES.quality,
  };
}

export function loadFileToolPreferences(storage: Storage) {
  const raw = storage.getItem(FILE_TOOL_SETTINGS_KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    const current = fileToolPreferencesSchema.safeParse(value);
    if (current.success) return current.data;
    const migrated = migrateSettings(value);
    if (migrated) return migrated;
  } catch {
    // Invalid local state falls through to a clean reset.
  }
  storage.removeItem(FILE_TOOL_SETTINGS_KEY);
  return null;
}

export function saveFileToolPreferences(
  storage: Storage,
  preferences: FileToolPreferences,
) {
  storage.setItem(FILE_TOOL_SETTINGS_KEY, JSON.stringify(preferences));
}

export function resetFileToolPreferences(storage: Storage) {
  storage.removeItem(FILE_TOOL_SETTINGS_KEY);
}
