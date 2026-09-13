"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  COMPRESSION_PRESETS,
  DEFAULT_FILE_TOOL_PREFERENCES,
  FILE_TOOL_SETTINGS_VERSION,
  findCompressionPreset,
  loadFileToolPreferences,
  resetFileToolPreferences,
  saveFileToolPreferences,
  type CompressionPreset,
  type CompressionPresetId,
  type FileToolPreferences,
  type NamingSettings,
  type OutputFormat,
} from "@/features/compression";

export type CompressionMode = "quality" | "smart" | "target-size";
export type ResizeMode = "exact" | "max";
export type TargetPreset = "100" | "200" | "500" | "1024" | "custom";
export type TargetUnit = "kb" | "mb";
export type NameCase = "lowercase" | "unchanged" | "uppercase";

export interface IntakeSample {
  hasNonJpegSources: boolean;
  previewUrl: string | null;
}

export interface InitialCompressionSettings {
  compressionPreset: CompressionPresetId;
  outputFormat: OutputFormat;
}

export interface CompressionSettingsController {
  activePreset: CompressionPresetId;
  selectedPreset: CompressionPreset | undefined;
  allowDimensionReduction: boolean;
  compressionMode: CompressionMode;
  customNaming: boolean;
  customTarget: string;
  customTargetUnit: TargetUnit;
  customTargetBytes: number | null;
  jpegBackground: string;
  maxHeight: string;
  maxWidth: string;
  nameCase: NameCase;
  namePattern: string;
  namePrefix: string;
  nameSuffix: string;
  outputFormat: OutputFormat;
  preserveAspectRatio: boolean;
  quality: number;
  resizeEnabled: boolean;
  resizeMode: ResizeMode;
  sequencePadding: string;
  sequenceStart: string;
  stripMetadata: boolean;
  targetPreset: TargetPreset;
  targetBytes: number | null;
  parsedMaxWidth: number | null;
  parsedMaxHeight: number | null;
  parsedSequenceStart: number;
  parsedSequencePadding: number;
  resizeInputError: boolean;
  targetInputError: boolean;
  namingInputError: boolean;
  namingSettings: NamingSettings;
  preferencesNotice: string | null;
  revision: number;
  intakeSample: IntakeSample;
  setIntakeSample: (sample: IntakeSample) => void;
  applyPreset: (value: string) => void;
  resetSavedPreferences: () => void;
  updateAspectRatio: (preserve: boolean) => void;
  updateCompressionMode: (mode: CompressionMode) => void;
  updateCustomNaming: (enabled: boolean) => void;
  updateCustomTarget: (value: string) => void;
  updateCustomTargetUnit: (value: TargetUnit) => void;
  updateDimensionReduction: (enabled: boolean) => void;
  updateJpegBackground: (value: string) => void;
  updateMaxHeight: (value: string) => void;
  updateMaxWidth: (value: string) => void;
  updateNameCase: (value: NameCase) => void;
  updateNamePattern: (value: string) => void;
  updateNamePrefix: (value: string) => void;
  updateNameSuffix: (value: string) => void;
  updateOutputFormat: (value: string) => void;
  updateQuality: (value: string) => void;
  updateResizeEnabled: (enabled: boolean) => void;
  updateResizeMode: (mode: ResizeMode) => void;
  updateSequencePadding: (value: string) => void;
  updateSequenceStart: (value: string) => void;
  updateStripMetadata: (enabled: boolean) => void;
  updateTargetPreset: (preset: TargetPreset) => void;
}

const CompressionSettingsContext = createContext<CompressionSettingsController | null>(
  null,
);

function parseDimension(value: string) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 32_768 ? number : null;
}

function parseTargetBytes(value: string, unit: TargetUnit) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const bytes = Math.round(amount * (unit === "mb" ? 1024 * 1024 : 1024));
  return Number.isSafeInteger(bytes) && bytes <= 1024 * 1024 * 1024 ? bytes : null;
}

function isOutputFormat(value: string): value is OutputFormat {
  return ["keep", "jpeg", "png", "webp", "avif"].includes(value);
}

function isNameCase(value: string): value is NameCase {
  return ["lowercase", "unchanged", "uppercase"].includes(value);
}

function formatOutputName(format: OutputFormat) {
  if (format === "keep") return "Keep original";
  if (format === "jpeg") return "JPEG";
  if (format === "webp") return "WebP";
  return format.toUpperCase();
}

export function describeOutputFormat(format: OutputFormat) {
  return formatOutputName(format);
}

export function describeCompressionMode(
  mode: CompressionMode,
  quality: number,
  targetPreset: TargetPreset,
  customTarget: string,
  customTargetUnit: TargetUnit,
) {
  if (mode === "smart") return "Smart";
  if (mode === "quality") return `${quality}% quality`;
  if (targetPreset === "custom") {
    return `Under ${customTarget || "?"} ${customTargetUnit.toUpperCase()}`;
  }
  return targetPreset === "1024" ? "Under 1 MB" : `Under ${targetPreset} KB`;
}

export function describeResize(
  enabled: boolean,
  mode: ResizeMode,
  width: string,
  height: string,
) {
  if (!enabled) return "Original size";
  if (mode === "exact") {
    return width && height ? `${width} × ${height} exact` : "Exact size";
  }
  const parts = [width ? `≤ ${width}w` : null, height ? `≤ ${height}h` : null].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(" · ") : "Fit within a box";
}

function withInitialSettings(
  preferences: FileToolPreferences,
  initialSettings: InitialCompressionSettings | undefined,
): FileToolPreferences {
  if (!initialSettings) return preferences;

  const preset = findCompressionPreset(initialSettings.compressionPreset);
  if (!preset) {
    return {
      ...preferences,
      activePreset: "custom",
      allowDimensionReduction: false,
      compressionMode: DEFAULT_FILE_TOOL_PREFERENCES.compressionMode,
      outputFormat: initialSettings.outputFormat,
      quality: DEFAULT_FILE_TOOL_PREFERENCES.quality,
      resizeEnabled: false,
      targetPreset: DEFAULT_FILE_TOOL_PREFERENCES.targetPreset,
    };
  }

  const resize = preset.resize;
  return {
    ...preferences,
    activePreset: preset.id,
    allowDimensionReduction: preset.mode.mode === "target-size",
    compressionMode: preset.mode.mode,
    maxHeight:
      resize.mode === "original"
        ? preferences.maxHeight
        : String(resize.mode === "max" ? (resize.maxHeight ?? "") : resize.height),
    maxWidth:
      resize.mode === "original"
        ? preferences.maxWidth
        : String(resize.mode === "max" ? (resize.maxWidth ?? "") : resize.width),
    outputFormat: initialSettings.outputFormat,
    preserveAspectRatio:
      resize.mode === "exact"
        ? resize.maintainAspectRatio
        : preferences.preserveAspectRatio,
    quality: preset.mode.mode === "quality" ? preset.mode.quality : preferences.quality,
    resizeEnabled: resize.mode !== "original",
    resizeMode: resize.mode === "exact" ? "exact" : "max",
    stripMetadata: true,
    targetPreset:
      preset.mode.mode === "target-size"
        ? (String(preset.mode.targetKilobytes) as TargetPreset)
        : preferences.targetPreset,
  };
}

export function CompressionSettingsProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings?: InitialCompressionSettings;
}) {
  const [initialPreferences] = useState(() =>
    withInitialSettings(DEFAULT_FILE_TOOL_PREFERENCES, initialSettings),
  );
  const [activePreset, setActivePreset] = useState<CompressionPresetId>(
    initialPreferences.activePreset,
  );
  const [allowDimensionReduction, setAllowDimensionReduction] = useState(
    initialPreferences.allowDimensionReduction,
  );
  const [compressionMode, setCompressionMode] = useState<CompressionMode>(
    initialPreferences.compressionMode,
  );
  const [customNaming, setCustomNaming] = useState(initialPreferences.customNaming);
  const [customTarget, setCustomTarget] = useState(initialPreferences.customTarget);
  const [customTargetUnit, setCustomTargetUnit] = useState<TargetUnit>(
    initialPreferences.customTargetUnit,
  );
  const [jpegBackground, setJpegBackground] = useState(initialPreferences.jpegBackground);
  const [maxHeight, setMaxHeight] = useState(initialPreferences.maxHeight);
  const [maxWidth, setMaxWidth] = useState(initialPreferences.maxWidth);
  const [nameCase, setNameCase] = useState<NameCase>(initialPreferences.nameCase);
  const [namePattern, setNamePattern] = useState(initialPreferences.namePattern);
  const [namePrefix, setNamePrefix] = useState(initialPreferences.namePrefix);
  const [nameSuffix, setNameSuffix] = useState(initialPreferences.nameSuffix);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    initialPreferences.outputFormat,
  );
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(
    initialPreferences.preserveAspectRatio,
  );
  const [quality, setQuality] = useState(initialPreferences.quality);
  const [resizeEnabled, setResizeEnabled] = useState(initialPreferences.resizeEnabled);
  const [resizeMode, setResizeMode] = useState<ResizeMode>(initialPreferences.resizeMode);
  const [sequencePadding, setSequencePadding] = useState(
    initialPreferences.sequencePadding,
  );
  const [sequenceStart, setSequenceStart] = useState(initialPreferences.sequenceStart);
  const [stripMetadata, setStripMetadata] = useState(initialPreferences.stripMetadata);
  const [targetPreset, setTargetPreset] = useState<TargetPreset>(
    initialPreferences.targetPreset,
  );
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [preferencesNotice, setPreferencesNotice] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [intakeSample, setIntakeSampleState] = useState<IntakeSample>({
    hasNonJpegSources: false,
    previewUrl: null,
  });

  function applyPreferences(preferences: FileToolPreferences) {
    setActivePreset(preferences.activePreset);
    setAllowDimensionReduction(preferences.allowDimensionReduction);
    setCompressionMode(preferences.compressionMode);
    setCustomNaming(preferences.customNaming);
    setCustomTarget(preferences.customTarget);
    setCustomTargetUnit(preferences.customTargetUnit);
    setJpegBackground(preferences.jpegBackground);
    setMaxHeight(preferences.maxHeight);
    setMaxWidth(preferences.maxWidth);
    setNameCase(preferences.nameCase);
    setNamePattern(preferences.namePattern);
    setNamePrefix(preferences.namePrefix);
    setNameSuffix(preferences.nameSuffix);
    setOutputFormat(preferences.outputFormat);
    setPreserveAspectRatio(preferences.preserveAspectRatio);
    setQuality(preferences.quality);
    setResizeEnabled(preferences.resizeEnabled);
    setResizeMode(preferences.resizeMode);
    setSequencePadding(preferences.sequencePadding);
    setSequenceStart(preferences.sequenceStart);
    setStripMetadata(preferences.stripMetadata);
    setTargetPreset(preferences.targetPreset);
  }

  useEffect(() => {
    let active = true;
    const hydrateStoredPreferences = () => {
      if (!active) return;
      let preferences: FileToolPreferences | null = null;
      try {
        preferences = loadFileToolPreferences(window.localStorage);
      } catch {
        preferences = null;
      }
      applyPreferences(
        withInitialSettings(
          preferences ?? DEFAULT_FILE_TOOL_PREFERENCES,
          initialSettings,
        ),
      );
      setPreferencesLoaded(true);
    };
    // Persisted settings are client-only, so they hydrate after mount to keep
    // the server and first client render identical.
    queueMicrotask(hydrateStoredPreferences);
    return () => {
      active = false;
    };
  }, [initialSettings]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    try {
      saveFileToolPreferences(window.localStorage, {
        activePreset,
        allowDimensionReduction,
        compressionMode,
        customNaming,
        customTarget,
        customTargetUnit,
        jpegBackground,
        maxHeight,
        maxWidth,
        nameCase,
        namePattern,
        namePrefix,
        nameSuffix,
        outputFormat,
        preserveAspectRatio,
        quality,
        resizeEnabled,
        resizeMode,
        sequencePadding,
        sequenceStart,
        stripMetadata,
        targetPreset,
        version: FILE_TOOL_SETTINGS_VERSION,
      });
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
  }, [
    activePreset,
    allowDimensionReduction,
    compressionMode,
    customNaming,
    customTarget,
    customTargetUnit,
    jpegBackground,
    maxHeight,
    maxWidth,
    nameCase,
    namePattern,
    namePrefix,
    nameSuffix,
    outputFormat,
    preferencesLoaded,
    preserveAspectRatio,
    quality,
    resizeEnabled,
    resizeMode,
    sequencePadding,
    sequenceStart,
    stripMetadata,
    targetPreset,
  ]);

  const setIntakeSample = useCallback((sample: IntakeSample) => {
    setIntakeSampleState((current) =>
      current.previewUrl === sample.previewUrl &&
      current.hasNonJpegSources === sample.hasNonJpegSources
        ? current
        : sample,
    );
  }, []);

  function beginChange() {
    setActivePreset("custom");
    setPreferencesNotice(null);
    setRevision((current) => current + 1);
  }

  function updateResizeEnabled(enabled: boolean) {
    beginChange();
    setResizeEnabled(enabled);
  }

  function updateOutputFormat(value: string) {
    if (!isOutputFormat(value)) return;
    beginChange();
    setOutputFormat(value);
  }

  function updateJpegBackground(value: string) {
    beginChange();
    setJpegBackground(value);
  }

  function updateQuality(value: string) {
    const nextQuality = Number(value);
    if (!Number.isInteger(nextQuality) || nextQuality < 1 || nextQuality > 100) return;
    beginChange();
    setQuality(nextQuality);
  }

  function updateCompressionMode(mode: CompressionMode) {
    beginChange();
    setCompressionMode(mode);
  }

  function updateTargetPreset(preset: TargetPreset) {
    beginChange();
    setTargetPreset(preset);
  }

  function updateCustomTarget(value: string) {
    beginChange();
    setCustomTarget(value);
  }

  function updateCustomTargetUnit(value: TargetUnit) {
    if (value !== "kb" && value !== "mb") return;
    beginChange();
    setCustomTargetUnit(value);
  }

  function updateDimensionReduction(enabled: boolean) {
    beginChange();
    setAllowDimensionReduction(enabled);
  }

  function updateCustomNaming(enabled: boolean) {
    beginChange();
    setCustomNaming(enabled);
  }

  function updateStripMetadata(enabled: boolean) {
    beginChange();
    setStripMetadata(enabled);
  }

  function updateNamePrefix(value: string) {
    beginChange();
    setNamePrefix(value);
  }

  function updateNameSuffix(value: string) {
    beginChange();
    setNameSuffix(value);
  }

  function updateNamePattern(value: string) {
    beginChange();
    setNamePattern(value);
  }

  function updateSequenceStart(value: string) {
    beginChange();
    setSequenceStart(value);
  }

  function updateSequencePadding(value: string) {
    beginChange();
    setSequencePadding(value);
  }

  function updateNameCase(value: NameCase) {
    if (!isNameCase(value)) return;
    beginChange();
    setNameCase(value);
  }

  function updateResizeMode(mode: ResizeMode) {
    beginChange();
    setResizeMode(mode);
  }

  function updateAspectRatio(preserve: boolean) {
    beginChange();
    setPreserveAspectRatio(preserve);
  }

  function updateMaxWidth(value: string) {
    beginChange();
    setMaxWidth(value);
  }

  function updateMaxHeight(value: string) {
    beginChange();
    setMaxHeight(value);
  }

  function applyPreset(value: string) {
    const preset = COMPRESSION_PRESETS.find((candidate) => candidate.id === value);
    if (!preset) {
      setActivePreset("custom");
      setPreferencesNotice(null);
      setRevision((current) => current + 1);
      return;
    }
    beginChange();
    setActivePreset(preset.id);
    setOutputFormat(preset.outputFormat);
    setStripMetadata(true);
    setCompressionMode(preset.mode.mode);
    if (preset.mode.mode === "quality") setQuality(preset.mode.quality);
    if (preset.mode.mode === "target-size") {
      setTargetPreset(String(preset.mode.targetKilobytes) as TargetPreset);
      setAllowDimensionReduction(true);
    } else {
      setAllowDimensionReduction(false);
    }
    if (preset.resize.mode === "original") {
      setResizeEnabled(false);
      return;
    }
    setResizeEnabled(true);
    setResizeMode(preset.resize.mode);
    if (preset.resize.mode === "max") {
      setMaxWidth(preset.resize.maxWidth ? String(preset.resize.maxWidth) : "");
      setMaxHeight(preset.resize.maxHeight ? String(preset.resize.maxHeight) : "");
    } else {
      setMaxWidth(String(preset.resize.width));
      setMaxHeight(String(preset.resize.height));
      setPreserveAspectRatio(preset.resize.maintainAspectRatio);
    }
  }

  function resetSavedPreferences() {
    try {
      resetFileToolPreferences(window.localStorage);
    } catch {
      // Storage can be unavailable in private or restricted browsing modes.
    }
    applyPreferences(DEFAULT_FILE_TOOL_PREFERENCES);
    setPreferencesNotice("Settings reset to the private defaults.");
    setRevision((current) => current + 1);
  }

  const parsedMaxWidth = parseDimension(maxWidth);
  const parsedMaxHeight = parseDimension(maxHeight);
  const resizeInputError =
    resizeEnabled &&
    ((resizeMode === "exact" && (!parsedMaxWidth || !parsedMaxHeight)) ||
      (resizeMode === "max" && !parsedMaxWidth && !parsedMaxHeight));
  const customTargetBytes = parseTargetBytes(customTarget, customTargetUnit);
  const targetBytes =
    targetPreset === "custom" ? customTargetBytes : Number(targetPreset) * 1024;
  const targetInputError = compressionMode === "target-size" && !targetBytes;
  const parsedSequenceStart = Number(sequenceStart);
  const parsedSequencePadding = Number(sequencePadding);
  const namingInputError =
    customNaming &&
    (!Number.isInteger(parsedSequenceStart) ||
      parsedSequenceStart < 0 ||
      parsedSequenceStart > 999_999 ||
      !Number.isInteger(parsedSequencePadding) ||
      parsedSequencePadding < 1 ||
      parsedSequencePadding > 6);
  const namingSettings: NamingSettings = customNaming
    ? {
        letterCase: nameCase,
        mode: "pattern",
        padding: Number.isInteger(parsedSequencePadding) ? parsedSequencePadding : 1,
        pattern: namePattern,
        prefix: namePrefix,
        startNumber: Number.isInteger(parsedSequenceStart) ? parsedSequenceStart : 1,
        suffix: nameSuffix,
      }
    : { mode: "original" };

  const controller: CompressionSettingsController = {
    activePreset,
    allowDimensionReduction,
    applyPreset,
    compressionMode,
    customNaming,
    customTarget,
    customTargetBytes,
    customTargetUnit,
    intakeSample,
    jpegBackground,
    maxHeight,
    maxWidth,
    nameCase,
    namePattern,
    namePrefix,
    nameSuffix,
    namingInputError,
    namingSettings,
    outputFormat,
    parsedMaxHeight,
    parsedMaxWidth,
    parsedSequencePadding,
    parsedSequenceStart,
    preferencesNotice,
    preserveAspectRatio,
    quality,
    resizeEnabled,
    resizeInputError,
    resizeMode,
    resetSavedPreferences,
    revision,
    selectedPreset: findCompressionPreset(activePreset),
    sequencePadding,
    sequenceStart,
    setIntakeSample,
    stripMetadata,
    targetBytes,
    targetInputError,
    targetPreset,
    updateAspectRatio,
    updateCompressionMode,
    updateCustomNaming,
    updateCustomTarget,
    updateCustomTargetUnit,
    updateDimensionReduction,
    updateJpegBackground,
    updateMaxHeight,
    updateMaxWidth,
    updateNameCase,
    updateNamePattern,
    updateNamePrefix,
    updateNameSuffix,
    updateOutputFormat,
    updateQuality,
    updateResizeEnabled,
    updateResizeMode,
    updateSequencePadding,
    updateSequenceStart,
    updateStripMetadata,
    updateTargetPreset,
  };

  return (
    <CompressionSettingsContext.Provider value={controller}>
      {children}
    </CompressionSettingsContext.Provider>
  );
}

export function useCompressionSettings() {
  const value = useContext(CompressionSettingsContext);
  if (!value) {
    throw new Error(
      "useCompressionSettings must be used within CompressionSettingsProvider.",
    );
  }
  return value;
}
