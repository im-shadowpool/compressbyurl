"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MaterialSymbol } from "@/components/icons";
import { MediaFrame } from "@/components/media";
import {
  Button,
  Dialog,
  IconButton,
  Input,
  SegmentedControl,
  Select,
  Slider,
} from "@/components/ui";
import {
  createDefaultCompressionSettings,
  createImageZip,
  createOutputName,
  COMPRESSION_PRESETS,
  DEFAULT_FILE_TOOL_PREFERENCES,
  FILE_TOOL_SETTINGS_VERSION,
  findCompressionPreset,
  loadFileToolPreferences,
  resetFileToolPreferences,
  resolveBatchConcurrency,
  resolveOutputFormat,
  resolveUniqueOutputName,
  saveFileToolPreferences,
  type CompressionProgress,
  type CompressionPresetId,
  type CompressionResult,
  type FileToolPreferences,
  type NamingSettings,
  type OutputFormat,
} from "@/features/compression";
import { media } from "@/lib/media";
import { CompressionWorkerClient, isCompressionWorkerError } from "@/workers";

import { prepareImageFile, revokePreview } from "./create-preview";
import { formatBytes } from "./format-bytes";
import { FILE_INPUT_ACCEPT, type AcceptedImageFormat, type IntakeItem } from "./types";

function createItemId() {
  return crypto.randomUUID();
}

type CompressionActionState =
  | { status: "idle" }
  | { status: "queued" }
  | { status: "processing"; progress: CompressionProgress }
  | {
      status: "completed";
      result: CompressionResult;
      baseOutputName: string;
      downloadUrl: string;
    }
  | { status: "failed"; message: string }
  | { status: "cancelled" };

type ZipState =
  | { status: "idle" }
  | { status: "generating"; percent: number }
  | { status: "ready"; downloadUrl: string; size: number }
  | { status: "failed"; message: string };

function describeSavings(result: CompressionResult) {
  const magnitude = Math.abs(result.savedPercent).toFixed(1);
  return result.savedBytes >= 0 ? `${magnitude}% smaller` : `${magnitude}% larger`;
}

function progressLabel(progress: CompressionProgress) {
  if (progress.stage === "decoding") return "Decoding image";
  if (progress.stage === "normalizing-orientation") return "Fixing orientation";
  if (progress.stage === "resizing") return "Resizing image";
  if (progress.stage === "encoding") return "Encoding image";
  if (progress.stage === "verifying") return "Verifying output";
  return "Preparing image";
}

function parseDimension(value: string) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 32_768 ? number : null;
}

function parseTargetBytes(value: string, unit: "kb" | "mb") {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const bytes = Math.round(amount * (unit === "mb" ? 1024 * 1024 : 1024));
  return Number.isSafeInteger(bytes) && bytes <= 1024 * 1024 * 1024 ? bytes : null;
}

function outputFormatLabel(format: OutputFormat) {
  return format === "keep" ? "Keep original" : formatName(format);
}

function formatName(format: AcceptedImageFormat) {
  if (format === "jpeg") return "JPEG";
  if (format === "webp") return "WebP";
  return format.toUpperCase();
}

function isOutputFormat(value: string): value is OutputFormat {
  return ["keep", "jpeg", "png", "webp", "avif"].includes(value);
}

function actionLabel(input: AcceptedImageFormat, output: OutputFormat) {
  const finalFormat = output === "keep" ? input : output;
  return output === "keep" || finalFormat === input
    ? `Compress ${formatName(finalFormat)}`
    : `Convert to ${formatName(finalFormat)}`;
}

interface FileIntakeProps {
  initialFiles?: readonly File[];
  replacementSources?: Readonly<Record<string, string>>;
}

export function FileIntake({ initialFiles, replacementSources }: FileIntakeProps = {}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const browseButtonRef = useRef<HTMLButtonElement>(null);
  const regionRef = useRef<HTMLElement>(null);
  const dragDepth = useRef(0);
  const generation = useRef(0);
  const mounted = useRef(true);
  const previewUrls = useRef(new Set<string>());
  const outputUrls = useRef(new Map<string, string>());
  const activeControllers = useRef(new Map<string, AbortController>());
  const workerClient = useRef<CompressionWorkerClient | null>(null);
  const batchClients = useRef(new Set<CompressionWorkerClient>());
  const batchGeneration = useRef(0);
  const zipUrl = useRef<string | null>(null);
  const consumedInitialFiles = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<IntakeItem[]>([]);
  const [imageActions, setImageActions] = useState<
    Record<string, CompressionActionState>
  >({});
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("keep");
  const [jpegBackground, setJpegBackground] = useState("#ffffff");
  const [compressionMode, setCompressionMode] = useState<
    "quality" | "smart" | "target-size"
  >("smart");
  const [quality, setQuality] = useState(82);
  const [targetPreset, setTargetPreset] = useState<
    "100" | "200" | "500" | "1024" | "custom"
  >("100");
  const [customTarget, setCustomTarget] = useState("250");
  const [customTargetUnit, setCustomTargetUnit] = useState<"kb" | "mb">("kb");
  const [allowDimensionReduction, setAllowDimensionReduction] = useState(false);
  const [customNaming, setCustomNaming] = useState(false);
  const [namePrefix, setNamePrefix] = useState("");
  const [nameSuffix, setNameSuffix] = useState("-compressed");
  const [namePattern, setNamePattern] = useState("{name}");
  const [sequenceStart, setSequenceStart] = useState("1");
  const [sequencePadding, setSequencePadding] = useState("2");
  const [nameCase, setNameCase] = useState<"lowercase" | "unchanged" | "uppercase">(
    "unchanged",
  );
  const [resizeMode, setResizeMode] = useState<"exact" | "max">("max");
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true);
  const [maxWidth, setMaxWidth] = useState("1920");
  const [maxHeight, setMaxHeight] = useState("1080");
  const [pendingBatches, setPendingBatches] = useState(0);
  const [batchConcurrency, setBatchConcurrency] = useState(0);
  const [batchRunning, setBatchRunning] = useState(false);
  const [bulkDownloadMessage, setBulkDownloadMessage] = useState<string | null>(null);
  const [zipState, setZipState] = useState<ZipState>({ status: "idle" });
  const [stripMetadata, setStripMetadata] = useState(true);
  const [compareItemId, setCompareItemId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<CompressionPresetId>("custom");
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [preferencesNotice, setPreferencesNotice] = useState<string | null>(null);

  useEffect(() => {
    const preferences = loadFileToolPreferences(window.localStorage);
    if (preferences) {
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
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
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

  useEffect(() => {
    const objectUrls = previewUrls.current;
    const compressionControllers = activeControllers.current;
    const generatedOutputUrls = outputUrls.current;
    const compressionBatchClients = batchClients.current;
    mounted.current = true;
    return () => {
      mounted.current = false;
      compressionControllers.forEach((controller) => controller.abort());
      compressionControllers.clear();
      workerClient.current?.dispose();
      workerClient.current = null;
      compressionBatchClients.forEach((client) => client.dispose());
      compressionBatchClients.clear();
      if (zipUrl.current) URL.revokeObjectURL(zipUrl.current);
      zipUrl.current = null;
      objectUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
      objectUrls.clear();
      generatedOutputUrls.forEach((outputUrl) => URL.revokeObjectURL(outputUrl));
      generatedOutputUrls.clear();
    };
  }, []);

  function releaseOutput(id: string) {
    const outputUrl = outputUrls.current.get(id);
    if (!outputUrl) return;
    URL.revokeObjectURL(outputUrl);
    outputUrls.current.delete(id);
  }

  function resetGeneratedOutputs() {
    batchGeneration.current += 1;
    batchClients.current.forEach((client) => client.dispose());
    batchClients.current.clear();
    setBatchRunning(false);
    setBatchConcurrency(0);
    setBulkDownloadMessage(null);
    resetZip();
    setCompareItemId(null);
    activeControllers.current.forEach((controller) => controller.abort());
    activeControllers.current.clear();
    outputUrls.current.forEach((outputUrl) => URL.revokeObjectURL(outputUrl));
    outputUrls.current.clear();
    setImageActions({});
  }

  function resetAfterSettingsChange() {
    resetGeneratedOutputs();
    setActivePreset("custom");
    setPreferencesNotice(null);
  }

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

  function resetSavedPreferences() {
    resetGeneratedOutputs();
    resetFileToolPreferences(window.localStorage);
    applyPreferences(DEFAULT_FILE_TOOL_PREFERENCES);
    setPreferencesNotice("Settings reset to the private defaults.");
  }

  function resetZip() {
    if (zipUrl.current) URL.revokeObjectURL(zipUrl.current);
    zipUrl.current = null;
    setZipState({ status: "idle" });
  }

  function resolveActionNameCollisions(actions: Record<string, CompressionActionState>) {
    const usedNames = new Set<string>();
    const resolved = { ...actions };
    for (const item of items) {
      const action = resolved[item.id];
      if (action?.status !== "completed") continue;
      const outputName = resolveUniqueOutputName(action.baseOutputName, usedNames);
      resolved[item.id] = {
        ...action,
        result: { ...action.result, outputName },
      };
    }
    return resolved;
  }

  async function compressImage(
    item: Extract<IntakeItem, { status: "ready" }>,
    assignedClient?: CompressionWorkerClient,
  ) {
    releaseOutput(item.id);
    activeControllers.current.get(item.id)?.abort();
    const controller = new AbortController();
    activeControllers.current.set(item.id, controller);
    setImageActions((current) => ({
      ...current,
      [item.id]: {
        progress: { percent: 0, sourceId: item.id, stage: "validating" },
        status: "processing",
      },
    }));

    try {
      const client =
        assignedClient ?? workerClient.current ?? new CompressionWorkerClient();
      if (!assignedClient) workerClient.current = client;
      await client.waitUntilReady();
      const settings = createDefaultCompressionSettings();
      const parsedWidth = parseDimension(maxWidth);
      const parsedHeight = parseDimension(maxHeight);
      if (
        resizeEnabled &&
        ((resizeMode === "exact" && (!parsedWidth || !parsedHeight)) ||
          (resizeMode === "max" && !parsedWidth && !parsedHeight))
      ) {
        setImageActions((current) => ({
          ...current,
          [item.id]: {
            message: "Enter dimensions from 1 to 32,768 pixels.",
            status: "failed",
          },
        }));
        return;
      }
      const resize = !resizeEnabled
        ? settings.resize
        : resizeMode === "exact"
          ? {
              height: parsedHeight ?? 1,
              maintainAspectRatio: preserveAspectRatio,
              mode: "exact" as const,
              preventUpscale: true,
              width: parsedWidth ?? 1,
            }
          : {
              maxHeight: parsedHeight,
              maxWidth: parsedWidth,
              mode: "max" as const,
              preventUpscale: true,
            };
      const customTargetBytes = parseTargetBytes(customTarget, customTargetUnit);
      const targetBytes =
        targetPreset === "custom" ? customTargetBytes : Number(targetPreset) * 1024;
      if (compressionMode === "target-size" && !targetBytes) {
        setImageActions((current) => ({
          ...current,
          [item.id]: {
            message: "Enter a target size greater than zero and no larger than 1 GB.",
            status: "failed",
          },
        }));
        return;
      }
      const parsedSequenceStart = Number(sequenceStart);
      const parsedSequencePadding = Number(sequencePadding);
      if (
        customNaming &&
        (!Number.isInteger(parsedSequenceStart) ||
          parsedSequenceStart < 0 ||
          parsedSequenceStart > 999_999 ||
          !Number.isInteger(parsedSequencePadding) ||
          parsedSequencePadding < 1 ||
          parsedSequencePadding > 6)
      ) {
        setImageActions((current) => ({
          ...current,
          [item.id]: {
            message: "Use a sequence start from 0 to 999,999 and padding from 1 to 6.",
            status: "failed",
          },
        }));
        return;
      }
      const result = await client.compress(
        {
          settings: {
            ...settings,
            jpegBackground,
            naming: customNaming
              ? {
                  letterCase: nameCase,
                  mode: "pattern" as const,
                  padding: parsedSequencePadding,
                  pattern: namePattern,
                  prefix: namePrefix,
                  startNumber: parsedSequenceStart,
                  suffix: nameSuffix,
                }
              : settings.naming,
            outputFormat,
            resize,
            stripMetadata,
            ...(compressionMode === "smart"
              ? { mode: "smart" as const }
              : compressionMode === "quality"
                ? { mode: "quality" as const, quality: quality / 100 }
                : {
                    allowDimensionReduction,
                    mode: "target-size" as const,
                    targetBytes: targetBytes ?? 1,
                  }),
          },
          source: {
            blob: item.file,
            dimensions: { height: item.height, width: item.width },
            format: item.format,
            id: item.id,
            mime: item.mime,
            name: item.name,
            sequence: items
              .filter((candidate) => candidate.status === "ready")
              .findIndex((candidate) => candidate.id === item.id),
          },
        },
        {
          onProgress: (progress) => {
            if (!mounted.current || controller.signal.aborted) return;
            setImageActions((current) => ({
              ...current,
              [item.id]: { progress, status: "processing" },
            }));
          },
          signal: controller.signal,
        },
      );
      if (!mounted.current || controller.signal.aborted) return;
      const downloadUrl = URL.createObjectURL(result.blob);
      resetZip();
      outputUrls.current.set(item.id, downloadUrl);
      setImageActions((current) =>
        resolveActionNameCollisions({
          ...current,
          [item.id]: {
            baseOutputName: result.outputName,
            downloadUrl,
            result,
            status: "completed",
          },
        }),
      );
    } catch (error) {
      if (!mounted.current) return;
      if (controller.signal.aborted) {
        setImageActions((current) => ({
          ...current,
          [item.id]: { status: "cancelled" },
        }));
        return;
      }
      setImageActions((current) => ({
        ...current,
        [item.id]: {
          message: isCompressionWorkerError(error)
            ? error.message
            : "This image could not be compressed.",
          status: "failed",
        },
      }));
    } finally {
      if (activeControllers.current.get(item.id) === controller) {
        activeControllers.current.delete(item.id);
      }
    }
  }

  function cancelCompression(id: string) {
    activeControllers.current.get(id)?.abort();
  }

  function cancelBatch() {
    batchGeneration.current += 1;
    activeControllers.current.forEach((controller) => controller.abort());
    batchClients.current.forEach((client) => client.dispose());
    batchClients.current.clear();
    setImageActions((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, action]) => [
          id,
          action.status === "queued" || action.status === "processing"
            ? { status: "cancelled" as const }
            : action,
        ]),
      ),
    );
    setBatchRunning(false);
    setBatchConcurrency(0);
  }

  function downloadAllIndividually() {
    const downloads = items.flatMap((item) => {
      const action = imageActions[item.id];
      return action?.status === "completed" ? [action] : [];
    });
    for (const download of downloads) {
      const link = document.createElement("a");
      link.download = download.result.outputName;
      link.href = download.downloadUrl;
      link.click();
    }
    setBulkDownloadMessage(
      `Started ${downloads.length} ${downloads.length === 1 ? "download" : "downloads"}.`,
    );
  }

  async function prepareZipDownload() {
    const completed = items.flatMap((item) => {
      const action = imageActions[item.id];
      return action?.status === "completed" ? [{ action, item }] : [];
    });
    const entries = completed.map(({ action }) => ({
      blob: action.result.blob,
      name: action.result.outputName,
    }));
    if (replacementSources) {
      const replacementMap = {
        generatedAt: new Date().toISOString(),
        replacements: completed.flatMap(({ action, item }) => {
          const sourceUrl = replacementSources[item.name];
          return sourceUrl
            ? [
                {
                  sourceUrl,
                  sourceFile: item.name,
                  replacementFile: action.result.outputName,
                  originalBytes: item.size,
                  optimizedBytes: action.result.outputBytes,
                  width: action.result.outputDimensions.width,
                  height: action.result.outputDimensions.height,
                  format: action.result.outputFormat,
                },
              ]
            : [];
        }),
        version: 1,
      };
      entries.push({
        blob: new Blob([JSON.stringify(replacementMap, null, 2)], {
          type: "application/json",
        }),
        name: "replacement-map.json",
      });
    }
    if (entries.length === 0) return;
    resetZip();
    setZipState({ percent: 0, status: "generating" });
    try {
      let lastReportedPercent = 0;
      const archive = await createImageZip(entries, ({ percent }) => {
        if (mounted.current && (percent === 100 || percent >= lastReportedPercent + 5)) {
          lastReportedPercent = percent;
          setZipState({ percent, status: "generating" });
        }
      });
      if (!mounted.current) return;
      const downloadUrl = URL.createObjectURL(archive);
      zipUrl.current = downloadUrl;
      setZipState({ downloadUrl, size: archive.size, status: "ready" });
    } catch (error) {
      if (!mounted.current) return;
      setZipState({
        message:
          error instanceof Error ? error.message : "The ZIP file could not be created.",
        status: "failed",
      });
    }
  }

  async function compressAll() {
    const readyItems = items.filter(
      (item): item is Extract<IntakeItem, { status: "ready" }> => item.status === "ready",
    );
    if (
      readyItems.length === 0 ||
      resizeInputError ||
      targetInputError ||
      namingInputError
    )
      return;

    resetGeneratedOutputs();
    const runGeneration = batchGeneration.current;
    const concurrency = resolveBatchConcurrency(
      readyItems,
      navigator.hardwareConcurrency || 2,
    );
    const clients = Array.from(
      { length: concurrency },
      () => new CompressionWorkerClient(),
    );
    clients.forEach((client) => batchClients.current.add(client));
    setBatchConcurrency(concurrency);
    setBatchRunning(true);
    setImageActions(
      Object.fromEntries(readyItems.map((item) => [item.id, { status: "queued" }])),
    );
    let nextIndex = 0;

    try {
      await Promise.all(
        clients.map(async (client) => {
          await client.waitUntilReady();
          while (
            mounted.current &&
            runGeneration === batchGeneration.current &&
            nextIndex < readyItems.length
          ) {
            const item = readyItems[nextIndex];
            nextIndex += 1;
            if (item) await compressImage(item, client);
          }
        }),
      );
    } finally {
      clients.forEach((client) => {
        client.dispose();
        batchClients.current.delete(client);
      });
      if (mounted.current && runGeneration === batchGeneration.current) {
        setBatchRunning(false);
        setBatchConcurrency(0);
      }
    }
  }

  function updateResizeEnabled(enabled: boolean) {
    resetAfterSettingsChange();
    setResizeEnabled(enabled);
  }

  function updateOutputFormat(value: string) {
    if (!isOutputFormat(value)) return;
    resetAfterSettingsChange();
    setOutputFormat(value);
  }

  function updateJpegBackground(value: string) {
    resetAfterSettingsChange();
    setJpegBackground(value);
  }

  function updateQuality(value: string) {
    const nextQuality = Number(value);
    if (!Number.isInteger(nextQuality) || nextQuality < 1 || nextQuality > 100) return;
    resetAfterSettingsChange();
    setQuality(nextQuality);
  }

  function updateCompressionMode(mode: "quality" | "smart" | "target-size") {
    resetAfterSettingsChange();
    setCompressionMode(mode);
  }

  function updateTargetPreset(preset: "100" | "200" | "500" | "1024" | "custom") {
    resetAfterSettingsChange();
    setTargetPreset(preset);
  }

  function updateCustomTarget(value: string) {
    resetAfterSettingsChange();
    setCustomTarget(value);
  }

  function updateCustomTargetUnit(value: string) {
    if (value !== "kb" && value !== "mb") return;
    resetAfterSettingsChange();
    setCustomTargetUnit(value);
  }

  function updateDimensionReduction(enabled: boolean) {
    resetAfterSettingsChange();
    setAllowDimensionReduction(enabled);
  }

  function updateCustomNaming(enabled: boolean) {
    resetAfterSettingsChange();
    setCustomNaming(enabled);
  }

  function updateStripMetadata(enabled: boolean) {
    resetAfterSettingsChange();
    setStripMetadata(enabled);
  }

  function updateNamePrefix(value: string) {
    resetAfterSettingsChange();
    setNamePrefix(value);
  }

  function updateNameSuffix(value: string) {
    resetAfterSettingsChange();
    setNameSuffix(value);
  }

  function updateNamePattern(value: string) {
    resetAfterSettingsChange();
    setNamePattern(value);
  }

  function updateSequenceStart(value: string) {
    resetAfterSettingsChange();
    setSequenceStart(value);
  }

  function updateSequencePadding(value: string) {
    resetAfterSettingsChange();
    setSequencePadding(value);
  }

  function updateNameCase(value: string) {
    if (!["lowercase", "unchanged", "uppercase"].includes(value)) return;
    resetAfterSettingsChange();
    setNameCase(value as "lowercase" | "unchanged" | "uppercase");
  }

  function updateResizeMode(mode: "exact" | "max") {
    resetAfterSettingsChange();
    setResizeMode(mode);
  }

  function updateAspectRatio(preserve: boolean) {
    resetAfterSettingsChange();
    setPreserveAspectRatio(preserve);
  }

  function updateMaxWidth(value: string) {
    resetAfterSettingsChange();
    setMaxWidth(value);
  }

  function updateMaxHeight(value: string) {
    resetAfterSettingsChange();
    setMaxHeight(value);
  }

  function applyPreset(value: string) {
    const preset = COMPRESSION_PRESETS.find((candidate) => candidate.id === value);
    if (!preset) {
      setActivePreset("custom");
      return;
    }
    resetGeneratedOutputs();
    setPreferencesNotice(null);
    setActivePreset(preset.id);
    setOutputFormat(preset.outputFormat);
    setStripMetadata(true);
    setCompressionMode(preset.mode.mode);
    if (preset.mode.mode === "quality") setQuality(preset.mode.quality);
    if (preset.mode.mode === "target-size") {
      setTargetPreset(
        String(preset.mode.targetKilobytes) as "100" | "200" | "500" | "1024",
      );
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

  const addFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    const intakeGeneration = generation.current;
    setPendingBatches((count) => count + 1);
    try {
      const results = await Promise.all(
        files.map((file) => prepareImageFile(file, createItemId())),
      );

      if (!mounted.current || intakeGeneration !== generation.current) {
        results.forEach(revokePreview);
        return;
      }

      results.forEach((item) => {
        if (item.status === "ready") previewUrls.current.add(item.previewUrl);
      });
      setItems((current) => [...current, ...results]);
    } finally {
      setPendingBatches((count) => Math.max(0, count - 1));
    }
  }, []);

  useEffect(() => {
    if (!initialFiles?.length || consumedInitialFiles.current) return;
    consumedInitialFiles.current = true;
    void addFiles([...initialFiles]);
  }, [addFiles, initialFiles]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (files.length === 0) return;
      event.preventDefault();
      void addFiles(files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    void addFiles(Array.from(event.dataTransfer.files));
  }

  function removeItem(id: string) {
    resetZip();
    if (batchRunning) cancelBatch();
    if (compareItemId === id) setCompareItemId(null);
    activeControllers.current.get(id)?.abort();
    activeControllers.current.delete(id);
    releaseOutput(id);
    const removedItem = items.find((item) => item.id === id);
    if (removedItem?.status === "ready") {
      revokePreview(removedItem);
      previewUrls.current.delete(removedItem.previewUrl);
    }
    setImageActions((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setItems((current) => current.filter((item) => item.id !== id));
    requestAnimationFrame(() => {
      const nextRemoveButton =
        regionRef.current?.querySelector<HTMLButtonElement>("[data-file-remove]");
      (nextRemoveButton ?? browseButtonRef.current)?.focus();
    });
  }

  function clearItems() {
    resetZip();
    if (batchRunning) cancelBatch();
    setCompareItemId(null);
    generation.current += 1;
    activeControllers.current.forEach((controller) => controller.abort());
    activeControllers.current.clear();
    outputUrls.current.forEach((outputUrl) => URL.revokeObjectURL(outputUrl));
    outputUrls.current.clear();
    previewUrls.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    previewUrls.current.clear();
    setImageActions({});
    setItems([]);
    requestAnimationFrame(() => browseButtonRef.current?.focus());
  }

  const readyCount = items.filter((item) => item.status === "ready").length;
  const rejectedCount = items.length - readyCount;
  const parsedWidth = parseDimension(maxWidth);
  const parsedHeight = parseDimension(maxHeight);
  const resizeInputError =
    resizeEnabled &&
    ((resizeMode === "exact" && (!parsedWidth || !parsedHeight)) ||
      (resizeMode === "max" && !parsedWidth && !parsedHeight));
  const transparencyWarning =
    outputFormat === "jpeg" &&
    items.some((item) => item.status === "ready" && item.format !== "jpeg");
  const jpegPreviewItem = items.find(
    (item) => item.status === "ready" && item.format !== "jpeg",
  );
  const qualityAvailable =
    outputFormat !== "png" &&
    !(
      outputFormat === "keep" &&
      readyCount > 0 &&
      items
        .filter((item) => item.status === "ready")
        .every((item) => item.format === "png")
    );
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
  const batchSummary = useMemo(() => {
    let afterBytes = 0;
    let beforeBytes = 0;
    let errorCount = 0;
    let successCount = 0;

    for (const item of items) {
      if (item.status !== "ready") continue;
      const action = imageActions[item.id];
      if (action?.status === "completed") {
        afterBytes += action.result.outputBytes;
        beforeBytes += action.result.originalBytes;
        successCount += 1;
      } else if (action?.status === "failed") {
        errorCount += 1;
      }
    }

    const savedBytes = beforeBytes - afterBytes;
    return {
      afterBytes,
      beforeBytes,
      errorCount,
      savedBytes,
      savedPercent: beforeBytes === 0 ? 0 : (savedBytes / beforeBytes) * 100,
      successCount,
    };
  }, [imageActions, items]);
  const showBatchSummary =
    readyCount > 1 && batchSummary.successCount + batchSummary.errorCount > 0;
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
  const namingPreviewItem = items.find((item) => item.status === "ready");
  const namingPreview = namingPreviewItem
    ? createOutputName(
        namingPreviewItem.name,
        resolveOutputFormat(namingPreviewItem.format, outputFormat),
        namingSettings,
        {
          dimensions: {
            height: namingPreviewItem.height,
            width: namingPreviewItem.width,
          },
          sequence: 0,
        },
      )
    : createOutputName("holiday-photo.jpg", "jpeg", namingSettings, {
        dimensions: { height: 800, width: 1200 },
        sequence: 0,
      });
  const comparisonItem = items.find(
    (item): item is Extract<IntakeItem, { status: "ready" }> =>
      item.status === "ready" && item.id === compareItemId,
  );
  const comparisonAction = compareItemId ? imageActions[compareItemId] : undefined;
  const comparison =
    comparisonItem && comparisonAction?.status === "completed"
      ? { action: comparisonAction, item: comparisonItem }
      : null;
  const selectedPreset = findCompressionPreset(activePreset);

  return (
    <section ref={regionRef} className="file-intake" aria-labelledby="file-intake-title">
      <div
        className={`file-dropzone${dragging ? " file-dropzone--active" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <MediaFrame
          asset={media.hero.compressionFlow}
          className="file-dropzone__media"
          priority
          sizes="(max-width: 640px) 112px, 152px"
        />
        <h2 id="file-intake-title">Drop or paste images here</h2>
        <p>JPEG, PNG, WebP or static AVIF. Paste, browse or add several files at once.</p>
        <input
          ref={inputRef}
          accept={FILE_INPUT_ACCEPT}
          hidden
          multiple
          onChange={handleInputChange}
          type="file"
        />
        <Button
          ref={browseButtonRef}
          leadingIcon={<MaterialSymbol name="folder_open" size={20} />}
          onClick={() => inputRef.current?.click()}
        >
          Browse files
        </Button>
      </div>

      <details className="file-intake__settings">
        <summary>
          <span>
            <MaterialSymbol name="bookmark" size={20} />
            Preset
          </span>
          <span>{selectedPreset?.label ?? "Custom settings"}</span>
        </summary>
        <div className="file-intake__settings-body">
          <Select
            hint="Choose a starting point, then adjust any setting below."
            label="Use case"
            onChange={(event) => applyPreset(event.target.value)}
            options={[
              { label: "Custom settings", value: "custom" },
              ...COMPRESSION_PRESETS.map((preset) => ({
                label: preset.label,
                value: preset.id,
              })),
            ]}
            value={activePreset}
          />
          {selectedPreset ? (
            <p className="file-intake__preset-description">
              {selectedPreset.description}
            </p>
          ) : null}
          <div className="file-intake__preset-storage">
            <div>
              <strong>Saved on this device</strong>
              <span>
                Preferences stay in this browser. Files and image data are never saved.
              </span>
            </div>
            <Button onClick={resetSavedPreferences} variant="ghost">
              Reset settings
            </Button>
          </div>
          {preferencesNotice ? (
            <p aria-live="polite" className="file-intake__setting-note" role="status">
              {preferencesNotice}
            </p>
          ) : null}
        </div>
      </details>

      <details className="file-intake__settings">
        <summary>
          <span>
            <MaterialSymbol name="swap_horiz" size={20} />
            Output format
          </span>
          <span>{outputFormatLabel(outputFormat)}</span>
        </summary>
        <div className="file-intake__settings-body">
          <Select
            hint="Keep original preserves each file's format. Conversion stays on this device."
            label="Save as"
            onChange={(event) => updateOutputFormat(event.target.value)}
            options={[
              { label: "Keep original format", value: "keep" },
              { label: "JPEG", value: "jpeg" },
              { label: "PNG", value: "png" },
              { label: "WebP", value: "webp" },
              { label: "AVIF", value: "avif" },
            ]}
            value={outputFormat}
          />
          {outputFormat === "jpeg" ? (
            <div className="file-intake__jpeg-background">
              <label>
                <span>Transparency background</span>
                <span className="file-intake__color-control">
                  <input
                    aria-label="JPEG background color"
                    onInput={(event) => updateJpegBackground(event.currentTarget.value)}
                    type="color"
                    value={jpegBackground}
                  />
                  <output>{jpegBackground.toUpperCase()}</output>
                </span>
              </label>
              <div
                className="file-intake__background-preview"
                style={{ backgroundColor: jpegBackground }}
              >
                {jpegPreviewItem?.status === "ready" ? (
                  <Image
                    alt={`Preview of ${jpegPreviewItem.name} on ${jpegBackground}`}
                    height={96}
                    src={jpegPreviewItem.previewUrl}
                    unoptimized
                    width={96}
                  />
                ) : (
                  <MaterialSymbol name="image" size={32} />
                )}
              </div>
              <p>Transparent pixels use this color in the JPEG.</p>
            </div>
          ) : null}
          {transparencyWarning ? (
            <p className="file-intake__format-warning" role="status">
              <MaterialSymbol name="opacity" size={20} />
              JPEG does not support transparency. Transparent areas will become{" "}
              {jpegBackground.toUpperCase()}.
            </p>
          ) : null}
        </div>
      </details>

      <details className="file-intake__settings">
        <summary>
          <span>
            <MaterialSymbol name="shield" size={20} />
            Privacy & metadata
          </span>
          <span>{stripMetadata ? "Metadata removed" : "Preserve when possible"}</span>
        </summary>
        <div className="file-intake__settings-body">
          <label className="file-intake__resize-toggle">
            <input
              checked={stripMetadata}
              onChange={(event) => updateStripMetadata(event.target.checked)}
              type="checkbox"
            />
            <span>
              <strong>Remove metadata (recommended)</strong>
              <small>
                Removes camera details, comments, color profiles, and GPS location data.
              </small>
            </span>
          </label>
          {!stripMetadata ? (
            <p className="file-intake__metadata-warning">
              JPEG-to-JPEG can preserve EXIF, IPTC, ICC, comments, and GPS data. Other
              format paths may only preserve part of the original metadata.
            </p>
          ) : null}
        </div>
      </details>

      <details className="file-intake__settings">
        <summary>
          <span>
            <MaterialSymbol name="auto_awesome" size={20} />
            Compression mode
          </span>
          <span>
            {compressionMode === "smart"
              ? "Smart"
              : compressionMode === "quality"
                ? "Custom quality"
                : "Target size"}
          </span>
        </summary>
        <div className="file-intake__settings-body">
          <SegmentedControl
            label="Compression mode"
            onValueChange={updateCompressionMode}
            options={[
              { label: "Smart", value: "smart" },
              { label: "Quality", value: "quality" },
              { label: "Target size", value: "target-size" },
            ]}
            value={compressionMode}
          />
          <p className="file-intake__setting-note">
            {compressionMode === "smart"
              ? "Recommended settings keep proportions and transparency-capable formats, never enlarge images, and remove metadata."
              : compressionMode === "quality"
                ? "Choose the balance between visual detail and file size."
                : "We find the highest tested quality that fits your limit."}
          </p>
          {compressionMode === "target-size" ? (
            <div className="file-intake__target-settings">
              <SegmentedControl
                label="Target size preset"
                onValueChange={updateTargetPreset}
                options={[
                  { label: "100 KB", value: "100" },
                  { label: "200 KB", value: "200" },
                  { label: "500 KB", value: "500" },
                  { label: "1 MB", value: "1024" },
                  { label: "Custom", value: "custom" },
                ]}
                value={targetPreset}
              />
              {targetPreset === "custom" ? (
                <div className="file-intake__target-custom">
                  <Input
                    error={
                      customTargetBytes
                        ? undefined
                        : "Enter a size greater than zero and no larger than 1 GB."
                    }
                    inputMode="decimal"
                    label="Target size"
                    min="0.01"
                    onChange={(event) => updateCustomTarget(event.target.value)}
                    step="0.01"
                    type="number"
                    value={customTarget}
                  />
                  <Select
                    label="Unit"
                    onChange={(event) => updateCustomTargetUnit(event.target.value)}
                    options={[
                      { label: "KB", value: "kb" },
                      { label: "MB", value: "mb" },
                    ]}
                    value={customTargetUnit}
                  />
                </div>
              ) : null}
              <label className="file-intake__resize-toggle file-intake__target-smart-fit">
                <input
                  checked={allowDimensionReduction}
                  onChange={(event) => updateDimensionReduction(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  <strong>Smart fit</strong>
                  <small>
                    If quality alone cannot reach the target, reduce dimensions while
                    preserving proportions. The shorter edge never goes below 256 px.
                  </small>
                </span>
              </label>
            </div>
          ) : null}
        </div>
      </details>

      {compressionMode === "quality" && qualityAvailable ? (
        <details className="file-intake__settings">
          <summary>
            <span>
              <MaterialSymbol name="tune" size={20} />
              Quality
            </span>
            <span>{quality}%</span>
          </summary>
          <div className="file-intake__settings-body">
            <Slider
              formatValue={(value) => `${value}%`}
              hint={
                outputFormat === "keep"
                  ? "Applies to JPEG, WebP, and AVIF. PNG remains lossless."
                  : "Higher quality keeps more detail and usually creates a larger file."
              }
              label="Compression quality"
              min={1}
              onChange={(event) => updateQuality(event.target.value)}
              value={quality}
            />
          </div>
        </details>
      ) : null}

      <details className="file-intake__settings">
        <summary>
          <span>
            <MaterialSymbol name="photo_size_select_large" size={20} />
            Resize output
          </span>
          <span>
            {resizeEnabled
              ? resizeMode === "exact"
                ? "Exact size"
                : "Fit within a box"
              : "Keep original size"}
          </span>
        </summary>
        <div className="file-intake__settings-body">
          <label className="file-intake__resize-toggle">
            <input
              checked={resizeEnabled}
              onChange={(event) => updateResizeEnabled(event.target.checked)}
              type="checkbox"
            />
            <span>
              <strong>Resize images</strong>
              <small>Choose a fitting rule. Smaller images never enlarge.</small>
            </span>
          </label>
          {resizeEnabled ? (
            <>
              <SegmentedControl
                className="file-intake__resize-modes"
                label="Resize behavior"
                onValueChange={updateResizeMode}
                options={[
                  { label: "Fit within", value: "max" },
                  { label: "Exact size", value: "exact" },
                ]}
                value={resizeMode}
              />
              <div className="file-intake__dimension-grid">
                <Input
                  aria-invalid={resizeInputError || undefined}
                  inputMode="numeric"
                  label={resizeMode === "exact" ? "Width" : "Maximum width"}
                  max={32768}
                  min={1}
                  onChange={(event) => updateMaxWidth(event.target.value)}
                  placeholder={resizeMode === "exact" ? undefined : "No limit"}
                  required={resizeMode === "exact"}
                  type="number"
                  value={maxWidth}
                />
                <Input
                  aria-invalid={resizeInputError || undefined}
                  inputMode="numeric"
                  label={resizeMode === "exact" ? "Height" : "Maximum height"}
                  max={32768}
                  min={1}
                  onChange={(event) => updateMaxHeight(event.target.value)}
                  placeholder={resizeMode === "exact" ? undefined : "No limit"}
                  required={resizeMode === "exact"}
                  type="number"
                  value={maxHeight}
                />
              </div>
              {resizeMode === "exact" ? (
                <label className="file-intake__resize-toggle file-intake__resize-toggle--nested">
                  <input
                    checked={preserveAspectRatio}
                    onChange={(event) => updateAspectRatio(event.target.checked)}
                    type="checkbox"
                  />
                  <span>
                    <strong>Preserve proportions</strong>
                    <small>
                      {preserveAspectRatio
                        ? "Center-crop to fill the exact size. No stretching."
                        : "Stretch to fill. Image proportions may change."}
                    </small>
                  </span>
                </label>
              ) : null}
              {resizeInputError ? (
                <p className="file-intake__settings-error" role="alert">
                  {resizeMode === "exact"
                    ? "Enter a width and height from 1 to 32,768 pixels."
                    : "Enter at least one valid maximum dimension."}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </details>

      <details className="file-intake__settings">
        <summary>
          <span>
            <MaterialSymbol name="drive_file_rename_outline" size={20} />
            File names
          </span>
          <span>{customNaming ? "Custom" : "Original names"}</span>
        </summary>
        <div className="file-intake__settings-body">
          <label className="file-intake__resize-toggle">
            <input
              checked={customNaming}
              onChange={(event) => updateCustomNaming(event.target.checked)}
              type="checkbox"
            />
            <span>
              <strong>Customize file names</strong>
              <small>Add a prefix or suffix and choose consistent letter casing.</small>
            </span>
          </label>
          {customNaming ? (
            <>
              <div className="file-intake__naming-grid">
                <Input
                  label="Prefix"
                  maxLength={40}
                  onChange={(event) => updateNamePrefix(event.target.value)}
                  placeholder="web-"
                  value={namePrefix}
                />
                <Input
                  label="Suffix"
                  maxLength={40}
                  onChange={(event) => updateNameSuffix(event.target.value)}
                  placeholder="-compressed"
                  value={nameSuffix}
                />
              </div>
              <Input
                hint="Tokens: {name}, {number}, {width}, {height}, {format}, {ext}, {page}"
                label="Naming pattern"
                maxLength={120}
                onChange={(event) => updateNamePattern(event.target.value)}
                placeholder="{name}-{number}"
                value={namePattern}
              />
              <div className="file-intake__naming-grid">
                <Input
                  error={
                    Number.isInteger(parsedSequenceStart) &&
                    parsedSequenceStart >= 0 &&
                    parsedSequenceStart <= 999_999
                      ? undefined
                      : "Enter a number from 0 to 999,999."
                  }
                  inputMode="numeric"
                  label="Sequence starts at"
                  max={999999}
                  min={0}
                  onChange={(event) => updateSequenceStart(event.target.value)}
                  type="number"
                  value={sequenceStart}
                />
                <Input
                  error={
                    Number.isInteger(parsedSequencePadding) &&
                    parsedSequencePadding >= 1 &&
                    parsedSequencePadding <= 6
                      ? undefined
                      : "Enter padding from 1 to 6."
                  }
                  inputMode="numeric"
                  label="Zero padding"
                  max={6}
                  min={1}
                  onChange={(event) => updateSequencePadding(event.target.value)}
                  type="number"
                  value={sequencePadding}
                />
              </div>
              <Select
                label="Letter case"
                onChange={(event) => updateNameCase(event.target.value)}
                options={[
                  { label: "Keep unchanged", value: "unchanged" },
                  { label: "lowercase", value: "lowercase" },
                  { label: "UPPERCASE", value: "uppercase" },
                ]}
                value={nameCase}
              />
            </>
          ) : null}
          <p className="file-intake__name-preview">
            <span>Example</span>
            <code>{namingPreview}</code>
          </p>
        </div>
      </details>

      {pendingBatches > 0 ? (
        <p className="file-intake__checking" role="status">
          <MaterialSymbol name="progress_activity" size={20} />
          Checking files locally
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="file-intake__results">
          <div className="file-intake__summary" aria-live="polite">
            <p>
              {readyCount} ready
              {rejectedCount > 0 ? ` · ${rejectedCount} rejected` : ""}
              {batchRunning ? ` · processing ${batchConcurrency} at a time` : ""}
            </p>
            <div className="file-intake__summary-actions">
              {batchSummary.successCount > 1 ? (
                <Button
                  leadingIcon={<MaterialSymbol name="download" size={20} />}
                  size="small"
                  variant="primary"
                  onClick={downloadAllIndividually}
                >
                  Download all
                </Button>
              ) : null}
              {batchSummary.successCount > 1 ||
              (replacementSources && batchSummary.successCount > 0) ? (
                zipState.status === "ready" ? (
                  <a
                    className="file-intake__zip-download motion-safe-transition"
                    download={
                      replacementSources
                        ? "website-replacements.zip"
                        : "compressed-images.zip"
                    }
                    href={zipState.downloadUrl}
                  >
                    <MaterialSymbol name="folder_zip" size={20} />
                    {`${replacementSources ? "Download replacement ZIP" : "Download ZIP"} · ${formatBytes(zipState.size)}`}
                  </a>
                ) : (
                  <Button
                    disabled={zipState.status === "generating"}
                    leadingIcon={<MaterialSymbol name="folder_zip" size={20} />}
                    size="small"
                    variant="secondary"
                    onClick={() => void prepareZipDownload()}
                  >
                    {zipState.status === "generating"
                      ? `Creating ZIP ${zipState.percent}%`
                      : replacementSources
                        ? "Create replacement ZIP"
                        : "Create ZIP"}
                  </Button>
                )
              ) : null}
              <Button
                disabled={resizeInputError || targetInputError || namingInputError}
                size="small"
                variant="secondary"
                onClick={batchRunning ? cancelBatch : () => void compressAll()}
              >
                {batchRunning ? "Cancel batch" : "Compress all"}
              </Button>
              <Button size="small" variant="ghost" onClick={clearItems}>
                Clear all
              </Button>
            </div>
            {bulkDownloadMessage ? (
              <span className="file-intake__bulk-download-status" role="status">
                {bulkDownloadMessage}
              </span>
            ) : null}
            {zipState.status === "failed" ? (
              <span className="file-intake__zip-error" role="alert">
                {zipState.message}
              </span>
            ) : null}
            {replacementSources && batchSummary.successCount > 0 ? (
              <span className="file-intake__bulk-download-status">
                The replacement ZIP includes replacement-map.json with source-to-output
                mappings.
              </span>
            ) : null}
          </div>
          {showBatchSummary ? (
            <section className="file-intake__batch-summary" aria-label="Batch results">
              <div>
                <span>Successful</span>
                <strong>{batchSummary.successCount}</strong>
              </div>
              <div>
                <span>Errors</span>
                <strong>{batchSummary.errorCount}</strong>
              </div>
              <div>
                <span>Before</span>
                <strong>{formatBytes(batchSummary.beforeBytes)}</strong>
              </div>
              <div>
                <span>After</span>
                <strong>{formatBytes(batchSummary.afterBytes)}</strong>
              </div>
              <p>
                {batchSummary.savedBytes >= 0
                  ? `${formatBytes(batchSummary.savedBytes)} saved · ${batchSummary.savedPercent.toFixed(1)}% smaller`
                  : `${formatBytes(Math.abs(batchSummary.savedBytes))} larger · ${Math.abs(batchSummary.savedPercent).toFixed(1)}% increase`}
              </p>
            </section>
          ) : null}
          <ul className="file-intake__list" aria-label="Selected files">
            {items.map((item) => {
              const imageAction = imageActions[item.id] ?? { status: "idle" };
              return (
                <li className={`file-item file-item--${item.status}`} key={item.id}>
                  {item.status === "ready" ? (
                    <span className="file-item__preview" aria-hidden="true">
                      <Image
                        alt=""
                        height={56}
                        src={item.previewUrl}
                        unoptimized
                        width={56}
                      />
                    </span>
                  ) : (
                    <span className="file-item__status" aria-hidden="true">
                      <MaterialSymbol name="error" size={20} filled />
                    </span>
                  )}
                  <span className="file-item__details">
                    <strong>{item.name}</strong>
                    {item.status === "ready" ? (
                      <>
                        <span>{`${formatName(item.format)} · ${formatBytes(item.size)}`}</span>
                        <span>{`${item.width} × ${item.height} px · ${item.mime}`}</span>
                        {imageAction.status === "processing" ? (
                          <span role="status">{`${progressLabel(imageAction.progress)} · ${imageAction.progress.percent}%`}</span>
                        ) : null}
                        {imageAction.status === "queued" ? (
                          <span role="status">Waiting in batch queue</span>
                        ) : null}
                        {imageAction.status === "completed" ? (
                          <>
                            <span className="file-item__success" role="status">
                              {`${formatBytes(imageAction.result.outputBytes)} · ${describeSavings(imageAction.result)} · ${imageAction.result.outputDimensions.width} × ${imageAction.result.outputDimensions.height} px`}
                            </span>
                            <span className="file-item__metadata-result">
                              {imageAction.result.metadata === "stripped"
                                ? "Metadata removed"
                                : imageAction.result.metadata === "preserved"
                                  ? "Metadata preserved"
                                  : "Metadata partially preserved"}
                            </span>
                            {compressionMode === "target-size" && targetBytes ? (
                              <span className="file-item__target-success">
                                <MaterialSymbol name="check_circle" size={20} filled />
                                {`Target met · ${formatBytes(imageAction.result.outputBytes)} of ${formatBytes(targetBytes)}`}
                              </span>
                            ) : null}
                            {imageAction.result.warnings.map((warning) => (
                              <span className="file-item__warning" key={warning.code}>
                                {warning.message}
                              </span>
                            ))}
                          </>
                        ) : null}
                        {imageAction.status === "failed" ? (
                          <span className="file-item__error" role="alert">
                            {imageAction.message}
                          </span>
                        ) : null}
                        {imageAction.status === "cancelled" ? (
                          <span role="status">Compression cancelled.</span>
                        ) : null}
                      </>
                    ) : (
                      <span>{item.message}</span>
                    )}
                  </span>
                  <span className="file-item__actions">
                    {item.status === "ready" ? (
                      imageAction.status === "queued" ? (
                        <Button size="small" variant="ghost" disabled>
                          Queued
                        </Button>
                      ) : imageAction.status === "processing" ? (
                        <Button
                          size="small"
                          variant="ghost"
                          onClick={() => cancelCompression(item.id)}
                        >
                          Cancel
                        </Button>
                      ) : imageAction.status === "completed" ? (
                        <>
                          <Button
                            size="small"
                            variant="ghost"
                            onClick={() => setCompareItemId(item.id)}
                          >
                            Compare
                          </Button>
                          <a
                            className="file-item__download motion-safe-transition"
                            download={imageAction.result.outputName}
                            href={imageAction.downloadUrl}
                          >
                            <MaterialSymbol name="download" size={20} />
                            {`Download ${formatName(imageAction.result.outputFormat)}`}
                          </a>
                        </>
                      ) : (
                        <Button
                          disabled={
                            resizeInputError || targetInputError || namingInputError
                          }
                          size="small"
                          variant="secondary"
                          onClick={() => void compressImage(item)}
                        >
                          {imageAction.status === "idle"
                            ? actionLabel(item.format, outputFormat)
                            : "Try again"}
                        </Button>
                      )
                    ) : null}
                    <IconButton
                      data-file-remove
                      icon={<MaterialSymbol name="close" size={20} />}
                      label={`Remove ${item.name}`}
                      onClick={() => removeItem(item.id)}
                      size="small"
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <Dialog
        className="file-compare"
        description="Inspect the original and optimized image without creating another full-resolution copy."
        onOpenChange={(open) => {
          if (!open) setCompareItemId(null);
        }}
        open={Boolean(comparison)}
        title={comparison ? `Compare ${comparison.item.name}` : "Compare images"}
        footer={
          comparison ? (
            <a
              className="file-item__download motion-safe-transition"
              download={comparison.action.result.outputName}
              href={comparison.action.downloadUrl}
            >
              <MaterialSymbol name="download" size={20} />
              Download optimized image
            </a>
          ) : null
        }
      >
        {comparison ? (
          <div className="file-compare__grid">
            <figure>
              <div className="file-compare__image">
                <Image
                  alt={`Original ${comparison.item.name}`}
                  height={comparison.item.height}
                  src={comparison.item.previewUrl}
                  unoptimized
                  width={comparison.item.width}
                />
              </div>
              <figcaption>
                <strong>Original</strong>
                <span>{formatName(comparison.item.format)}</span>
                <span>{formatBytes(comparison.item.size)}</span>
                <span>{`${comparison.item.width} × ${comparison.item.height} px`}</span>
              </figcaption>
            </figure>
            <figure>
              <div className="file-compare__image">
                <Image
                  alt={`Optimized ${comparison.action.result.outputName}`}
                  height={comparison.action.result.outputDimensions.height}
                  src={comparison.action.downloadUrl}
                  unoptimized
                  width={comparison.action.result.outputDimensions.width}
                />
              </div>
              <figcaption>
                <strong>Optimized</strong>
                <span>{formatName(comparison.action.result.outputFormat)}</span>
                <span>{formatBytes(comparison.action.result.outputBytes)}</span>
                <span>{`${comparison.action.result.outputDimensions.width} × ${comparison.action.result.outputDimensions.height} px`}</span>
              </figcaption>
            </figure>
          </div>
        ) : null}
      </Dialog>
    </section>
  );
}
