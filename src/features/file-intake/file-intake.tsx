"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { MaterialSymbol } from "@/components/icons";
import { MediaFrame } from "@/components/media";
import { Button, ButtonAnchor, Dialog, IconButton } from "@/components/ui";
import {
  createDefaultCompressionSettings,
  createImageZip,
  resolveBatchConcurrency,
  resolveUniqueOutputName,
  type CompressionProgress,
  type CompressionResult,
  type OutputFormat,
} from "@/features/compression";
import { classNames } from "@/lib/class-names";
import { media } from "@/lib/media";
import { STATIC_IMAGE_MIME_BY_FORMAT } from "@/types/image";
import { CompressionWorkerClient, isCompressionWorkerError } from "@/workers";

import { useCompressionSettings } from "./compression-settings";
import { prepareImageFile, revokePreview } from "./create-preview";
import { formatByteDelta, formatBytes } from "./format-bytes";
import type { AcceptedImageFormat, IntakeItem } from "./types";

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

function describeSavingsBadge(result: CompressionResult) {
  const percent = Math.abs(result.savedPercent);
  const formattedPercent =
    percent < 10 && percent % 1 !== 0
      ? percent.toFixed(1)
      : Math.round(percent).toString();

  if (result.savedBytes > 0) {
    return {
      text: `−${formattedPercent}%`,
      icon: "trending_down",
      className: "work-item__savings-badge--success",
      title: `${formatBytes(result.savedBytes)} saved (${percent.toFixed(1)}%)`,
    };
  }
  if (result.savedBytes < 0) {
    return {
      text: `+${formattedPercent}%`,
      icon: "trending_up",
      className: "work-item__savings-badge--warning",
      title: `${formatBytes(Math.abs(result.savedBytes))} larger (${percent.toFixed(1)}%)`,
    };
  }
  return {
    text: "0%",
    icon: "remove",
    className: "work-item__savings-badge--neutral",
    title: "No size change",
  };
}

function progressLabel(progress: CompressionProgress) {
  if (progress.stage === "decoding") return "Decoding image";
  if (progress.stage === "normalizing-orientation") return "Fixing orientation";
  if (progress.stage === "resizing") return "Resizing image";
  if (progress.stage === "encoding") return "Encoding image";
  if (progress.stage === "verifying") return "Verifying output";
  return "Preparing image";
}

function formatName(format: AcceptedImageFormat) {
  if (format === "jpeg") return "JPEG";
  if (format === "webp") return "WebP";
  return format.toUpperCase();
}

function actionLabel(input: AcceptedImageFormat, output: OutputFormat) {
  const finalFormat = output === "keep" ? input : output;
  return output === "keep" || finalFormat === input
    ? `Compress ${formatName(finalFormat)}`
    : `Convert to ${formatName(finalFormat)}`;
}

function metadataLabel(metadata: CompressionResult["metadata"]) {
  if (metadata === "stripped") return "Metadata removed";
  if (metadata === "preserved") return "Metadata preserved";
  return "Metadata partially preserved";
}

interface FileIntakeProps {
  acceptedFormats?: readonly AcceptedImageFormat[];
  initialFiles?: readonly File[];
  replacementSources?: Readonly<Record<string, string>>;
}

const ALL_ACCEPTED_FORMATS = ["jpeg", "png", "webp", "avif"] as const;
const LARGE_INTAKE_FILE_BYTES = 16 * 1024 * 1024;
const HUGE_INTAKE_FILE_BYTES = 32 * 1024 * 1024;
const LARGE_INTAKE_BATCH_BYTES = 64 * 1024 * 1024;

function resolveIntakeConcurrency(files: readonly File[]) {
  if (files.length === 0) return 0;
  const largestFile = Math.max(...files.map((file) => file.size));
  if (largestFile >= HUGE_INTAKE_FILE_BYTES) return 1;

  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  const available = Math.max(1, Math.floor((navigator.hardwareConcurrency || 2) / 2));
  const normalLimit = Math.min(3, available, files.length);
  return largestFile >= LARGE_INTAKE_FILE_BYTES || totalBytes >= LARGE_INTAKE_BATCH_BYTES
    ? Math.min(2, normalLimit)
    : normalLimit;
}

async function prepareFileBatch(
  files: readonly File[],
  acceptedFormats: readonly AcceptedImageFormat[],
) {
  const prepared: Array<IntakeItem | null> = files.map(() => null);
  let nextIndex = 0;
  const concurrency = resolveIntakeConcurrency(files);

  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (nextIndex < files.length) {
        const index = nextIndex;
        nextIndex += 1;
        const file = files[index];
        if (!file) continue;
        prepared[index] = await prepareImageFile(file, createItemId(), acceptedFormats);
      }
    }),
  );

  return prepared.filter((item): item is IntakeItem => item !== null);
}

export function FileIntake({
  acceptedFormats = ALL_ACCEPTED_FORMATS,
  initialFiles,
  replacementSources,
}: FileIntakeProps = {}) {
  const settings = useCompressionSettings();
  const titleId = useId();
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
  const [pendingBatches, setPendingBatches] = useState(0);
  const [batchRunning, setBatchRunning] = useState(false);
  const [bulkDownloadMessage, setBulkDownloadMessage] = useState<string | null>(null);
  const [zipState, setZipState] = useState<ZipState>({ status: "idle" });
  const [compareItemId, setCompareItemId] = useState<string | null>(null);
  const [comparePosition, setComparePosition] = useState(50);
  const [settingsNotice, setSettingsNotice] = useState(false);

  const {
    allowDimensionReduction,
    compressionMode,
    customNaming,
    jpegBackground,
    nameCase,
    namePattern,
    namePrefix,
    nameSuffix,
    namingInputError,
    outputFormat,
    parsedMaxHeight,
    parsedMaxWidth,
    parsedSequencePadding,
    parsedSequenceStart,
    preserveAspectRatio,
    quality,
    resizeEnabled,
    resizeInputError,
    resizeMode,
    revision,
    setIntakeSample,
    stripMetadata,
    targetBytes,
    targetInputError,
  } = settings;

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

  const resetZip = useCallback(() => {
    if (zipUrl.current) URL.revokeObjectURL(zipUrl.current);
    zipUrl.current = null;
    setZipState({ status: "idle" });
  }, []);

  const resetGeneratedOutputs = useCallback(() => {
    batchGeneration.current += 1;
    batchClients.current.forEach((client) => client.dispose());
    batchClients.current.clear();
    setBatchRunning(false);
    setBulkDownloadMessage(null);
    resetZip();
    setCompareItemId(null);
    activeControllers.current.forEach((controller) => controller.abort());
    activeControllers.current.clear();
    outputUrls.current.forEach((outputUrl) => URL.revokeObjectURL(outputUrl));
    outputUrls.current.clear();
    setImageActions({});
  }, [resetZip]);

  const appliedRevision = useRef(revision);
  useEffect(() => {
    if (appliedRevision.current === revision) return;
    appliedRevision.current = revision;
    setSettingsNotice(true);
    resetGeneratedOutputs();
  }, [resetGeneratedOutputs, revision]);

  async function compressImage(
    item: Extract<IntakeItem, { status: "ready" }>,
    assignedClient?: CompressionWorkerClient,
  ) {
    releaseOutput(item.id);
    activeControllers.current.get(item.id)?.abort();
    const controller = new AbortController();
    activeControllers.current.set(item.id, controller);
    setSettingsNotice(false);
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
      const defaults = createDefaultCompressionSettings();
      if (
        resizeEnabled &&
        ((resizeMode === "exact" && (!parsedMaxWidth || !parsedMaxHeight)) ||
          (resizeMode === "max" && !parsedMaxWidth && !parsedMaxHeight))
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
        ? defaults.resize
        : resizeMode === "exact"
          ? {
              height: parsedMaxHeight ?? 1,
              maintainAspectRatio: preserveAspectRatio,
              mode: "exact" as const,
              preventUpscale: true,
              width: parsedMaxWidth ?? 1,
            }
          : {
              maxHeight: parsedMaxHeight,
              maxWidth: parsedMaxWidth,
              mode: "max" as const,
              preventUpscale: true,
            };
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
            ...defaults,
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
              : defaults.naming,
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
      }
    }
  }

  const addFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const intakeGeneration = generation.current;
      setPendingBatches((count) => count + 1);
      try {
        const results = await prepareFileBatch(files, acceptedFormats);

        if (!mounted.current || intakeGeneration !== generation.current) {
          results.forEach(revokePreview);
          return;
        }

        results.forEach((item) => {
          if (item.status === "ready") previewUrls.current.add(item.previewUrl);
        });
        setItems((current) => [...current, ...results]);
        setSettingsNotice(false);
      } finally {
        setPendingBatches((count) => Math.max(0, count - 1));
      }
    },
    [acceptedFormats],
  );

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

  const sampleItem = items.find(
    (item): item is Extract<IntakeItem, { status: "ready" }> =>
      item.status === "ready" && item.format !== "jpeg",
  );
  useEffect(() => {
    setIntakeSample({
      hasNonJpegSources: Boolean(sampleItem),
      previewUrl: sampleItem?.previewUrl ?? null,
    });
  }, [sampleItem, setIntakeSample]);

  useEffect(
    () => () => setIntakeSample({ hasNonJpegSources: false, previewUrl: null }),
    [setIntakeSample],
  );

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDropzoneClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, label")) return;
    inputRef.current?.click();
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
    setSettingsNotice(false);
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

  const everyReadyCompleted =
    readyCount > 0 &&
    items
      .filter((item) => item.status === "ready")
      .every((item) => imageActions[item.id]?.status === "completed");
  const canArchive =
    batchSummary.successCount > 1 ||
    Boolean(replacementSources && batchSummary.successCount > 0);
  const statusPrimary = batchRunning
    ? `Optimizing ${Math.min(
        batchSummary.successCount + batchSummary.errorCount + 1,
        readyCount,
      )} of ${readyCount}`
    : batchSummary.successCount > 0
      ? `${batchSummary.successCount} optimized${batchSummary.errorCount > 0 ? ` · ${batchSummary.errorCount} failed` : ""}`
      : `${readyCount} ready${rejectedCount > 0 ? ` · ${rejectedCount} rejected` : ""}`;
  const statusSecondary =
    batchSummary.successCount > 0 && batchSummary.beforeBytes > 0
      ? batchSummary.savedBytes >= 0
        ? `${formatBytes(batchSummary.beforeBytes)} → ${formatBytes(batchSummary.afterBytes)} · ${batchSummary.savedPercent.toFixed(1)}% smaller`
        : `${formatBytes(batchSummary.beforeBytes)} → ${formatBytes(batchSummary.afterBytes)} · ${Math.abs(batchSummary.savedPercent).toFixed(1)}% larger`
      : "Processed locally · nothing is uploaded";

  const comparisonItem = items.find(
    (item): item is Extract<IntakeItem, { status: "ready" }> =>
      item.status === "ready" && item.id === compareItemId,
  );
  const comparisonAction = compareItemId ? imageActions[compareItemId] : undefined;
  const comparison =
    comparisonItem && comparisonAction?.status === "completed"
      ? { action: comparisonAction, item: comparisonItem }
      : null;
  const actionsDisabled = Boolean(
    resizeInputError || targetInputError || namingInputError,
  );

  return (
    <section ref={regionRef} aria-labelledby={titleId} className="file-intake">
      <h2 className="visually-hidden" id={titleId}>
        Upload and compress images
      </h2>
      <input
        ref={inputRef}
        accept={acceptedFormats
          .map((format) => STATIC_IMAGE_MIME_BY_FORMAT[format])
          .join(",")}
        hidden
        multiple
        onChange={handleInputChange}
        type="file"
      />

      {items.length === 0 ? (
        <div
          className={classNames(
            "file-dropzone motion-safe-transition",
            dragging && "file-dropzone--active",
          )}
          onClick={handleDropzoneClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <MediaFrame
            asset={media.hero.compressionFlow}
            className="file-dropzone__art"
            sizes="(max-width: 640px) 96px, 120px"
          />
          <h3 className="file-dropzone__title">Drop or paste images here</h3>
          <p className="file-dropzone__copy">
            {acceptedFormats.length === ALL_ACCEPTED_FORMATS.length
              ? "JPEG, PNG, WebP or static AVIF. Add one file or a whole batch."
              : `${acceptedFormats.map(formatName).join(", ")} only. Add one file or a whole batch.`}
          </p>
          <Button
            ref={browseButtonRef}
            leadingIcon={<MaterialSymbol name="folder_open" size={20} />}
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Browse files
          </Button>
          <ul aria-label="Supported formats" className="file-dropzone__chips">
            {acceptedFormats.map((format) => (
              <li key={format}>{formatName(format)}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          className={classNames(
            "file-intake__add motion-safe-transition",
            dragging && "file-intake__add--active",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <span aria-hidden="true" className="file-intake__add-icon">
            <MaterialSymbol name="add_photo_alternate" size={20} />
          </span>
          <p className="file-intake__add-copy">
            <strong>Add more images</strong>
            <span>Drag and drop anywhere in this panel, or paste a file.</span>
          </p>
          <Button
            ref={browseButtonRef}
            leadingIcon={<MaterialSymbol name="folder_open" size={20} />}
            onClick={() => inputRef.current?.click()}
            size="small"
            variant="secondary"
          >
            Add files
          </Button>
        </div>
      )}

      {pendingBatches > 0 ? (
        <p className="file-intake__checking" role="status">
          <MaterialSymbol name="progress_activity" size={20} />
          Checking files locally
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="workbench">
          <div className="workbench__bar">
            <div aria-live="polite" className="workbench__status">
              <strong className="tabular-nums">{statusPrimary}</strong>
              <span className="tabular-nums">{statusSecondary}</span>
            </div>
            <div className="workbench__actions">
              {batchRunning ? (
                <Button onClick={cancelBatch} size="small" variant="secondary">
                  Cancel batch
                </Button>
              ) : null}
              {!batchRunning && canArchive && zipState.status === "ready" ? (
                <ButtonAnchor
                  className="workbench__zip"
                  download={
                    replacementSources
                      ? "website-replacements.zip"
                      : "compressed-images.zip"
                  }
                  href={zipState.downloadUrl}
                  leadingIcon={<MaterialSymbol name="folder_zip" size={20} />}
                  size="small"
                >
                  {`Download ZIP · ${formatBytes(zipState.size)}`}
                </ButtonAnchor>
              ) : null}
              {!batchRunning && canArchive && zipState.status !== "ready" ? (
                <Button
                  disabled={zipState.status === "generating"}
                  leadingIcon={
                    zipState.status === "generating" ? undefined : (
                      <MaterialSymbol name="folder_zip" size={20} />
                    )
                  }
                  onClick={() => void prepareZipDownload()}
                  size="small"
                  variant="secondary"
                >
                  {zipState.status === "generating"
                    ? `Creating ZIP ${zipState.percent}%`
                    : replacementSources
                      ? "Create replacement ZIP"
                      : "Create ZIP"}
                </Button>
              ) : null}
              {!batchRunning && !everyReadyCompleted ? (
                <Button
                  disabled={actionsDisabled}
                  onClick={() => void compressAll()}
                  size="small"
                  variant={canArchive ? "secondary" : "primary"}
                >
                  {batchSummary.successCount > 0 ? "Compress remaining" : "Compress all"}
                </Button>
              ) : null}
              {!batchRunning && batchSummary.successCount > 1 ? (
                <Button onClick={downloadAllIndividually} size="small" variant="ghost">
                  Download all
                </Button>
              ) : null}
              <Button
                className="workbench__clear"
                onClick={clearItems}
                size="small"
                variant="ghost"
              >
                <MaterialSymbol name="delete_sweep" size={20} />
                Clear all
              </Button>
            </div>
          </div>

          {settingsNotice ? (
            <p className="workbench__note workbench__note--notice" role="status">
              <MaterialSymbol name="restart_alt" size={20} />
              Settings changed — compress again to apply them.
            </p>
          ) : null}
          {bulkDownloadMessage ? (
            <p className="workbench__note" role="status">
              <MaterialSymbol name="check_circle" size={20} />
              {bulkDownloadMessage}
            </p>
          ) : null}
          {zipState.status === "failed" ? (
            <p className="workbench__note workbench__note--error" role="alert">
              <MaterialSymbol name="error" size={20} />
              {zipState.message}
            </p>
          ) : null}
          {replacementSources && batchSummary.successCount > 0 ? (
            <p className="workbench__note">
              <MaterialSymbol name="description" size={20} />
              The replacement ZIP includes replacement-map.json with source-to-output
              mappings.
            </p>
          ) : null}

          <ul aria-label="Selected files" className="workbench__list">
            {items.map((item, index) => {
              const imageAction = imageActions[item.id] ?? { status: "idle" };
              const isReady = item.status === "ready";
              const completedResult =
                isReady && imageAction.status === "completed" ? imageAction.result : null;
              const delta =
                isReady && completedResult
                  ? formatByteDelta(item.size, completedResult.outputBytes)
                  : null;
              const savingsBadge = completedResult
                ? describeSavingsBadge(completedResult)
                : null;
              const dimensionsChanged =
                isReady &&
                completedResult !== null &&
                (item.width !== completedResult.outputDimensions.width ||
                  item.height !== completedResult.outputDimensions.height);
              const openComparison = () => {
                setComparePosition(50);
                setCompareItemId(item.id);
              };
              return (
                <li
                  className={`work-item work-item--${item.status}`}
                  key={item.id}
                  style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
                >
                  {isReady && imageAction.status === "completed" ? (
                    <button
                      aria-label={`Compare original and optimized ${item.name}`}
                      className="work-item__media work-item__media--compare motion-safe-transition"
                      onClick={openComparison}
                      type="button"
                    >
                      <Image
                        alt=""
                        height={64}
                        src={item.previewUrl}
                        unoptimized
                        width={64}
                      />
                      <span className="work-item__compare-overlay">
                        <MaterialSymbol name="compare" size={20} />
                        <span>Compare</span>
                      </span>
                    </button>
                  ) : isReady && item.previewUrl ? (
                    <span className="work-item__media">
                      <Image
                        alt=""
                        height={64}
                        src={item.previewUrl}
                        unoptimized
                        width={64}
                      />
                    </span>
                  ) : (
                    <span
                      aria-label="Image could not be decoded"
                      className="work-item__media work-item__media--error"
                      role="img"
                    >
                      <MaterialSymbol name="error" size={20} />
                    </span>
                  )}
                  <div className="work-item__body">
                    <div className="work-item__info">
                      <div className="work-item__head">
                        <strong className="work-item__name" title={item.name}>
                          {item.name}
                        </strong>
                      </div>
                      {item.status === "ready" ? (
                        <p className="work-item__meta tabular-nums">
                          {`${formatName(item.format)} · ${formatBytes(item.size)} · ${item.width} × ${item.height} px`}
                        </p>
                      ) : (
                        <p className="work-item__error">{item.message}</p>
                      )}
                      {item.status === "ready" && imageAction.status === "processing" ? (
                        <div className="work-item__progress" role="status">
                          <span aria-hidden="true" className="work-item__track">
                            <span
                              className="work-item__fill"
                              style={{
                                transform: `scaleX(${imageAction.progress.percent / 100})`,
                              }}
                            />
                          </span>
                          <span className="tabular-nums">
                            {`${progressLabel(imageAction.progress)} · ${imageAction.progress.percent}%`}
                          </span>
                        </div>
                      ) : null}
                      {item.status === "ready" && imageAction.status === "queued" ? (
                        <p className="work-item__meta" role="status">
                          Waiting in the batch queue…
                        </p>
                      ) : null}
                      {item.status === "ready" && imageAction.status === "failed" ? (
                        <p className="work-item__error" role="alert">
                          {imageAction.message}
                        </p>
                      ) : null}
                      {item.status === "ready" && imageAction.status === "cancelled" ? (
                        <p className="work-item__meta" role="status">
                          Compression cancelled.
                        </p>
                      ) : null}
                    </div>

                    {isReady && completedResult && delta && savingsBadge ? (
                      <div className="work-item__changes">
                        <div className="work-item__metrics tabular-nums">
                          <div className="work-item__size-flow">
                            <span
                              className="work-item__size-from"
                              title={`Original: ${formatBytes(item.size)}`}
                            >
                              {delta.from}
                            </span>
                            <MaterialSymbol
                              className="work-item__size-arrow"
                              name="arrow_forward"
                              size={20}
                            />
                            <span
                              className="work-item__size-to"
                              title={`Optimized: ${formatBytes(completedResult.outputBytes)}`}
                            >
                              {delta.to}
                            </span>
                          </div>

                          <span
                            className={classNames(
                              "work-item__savings-badge",
                              savingsBadge.className,
                            )}
                            title={savingsBadge.title}
                          >
                            <MaterialSymbol name={savingsBadge.icon} size={20} />
                            <span>{savingsBadge.text}</span>
                          </span>
                        </div>

                        <div className="work-item__specs tabular-nums">
                          <span className="work-item__format-pill">
                            {formatName(completedResult.outputFormat)}
                          </span>
                          <span className="work-item__specs-sep" aria-hidden="true">
                            ·
                          </span>
                          <span>{`${completedResult.outputDimensions.width} × ${completedResult.outputDimensions.height} px`}</span>
                          {dimensionsChanged ? (
                            <>
                              <span className="work-item__specs-sep" aria-hidden="true">
                                ·
                              </span>
                              <span
                                className="work-item__detail--resized"
                                title={`Resized from ${item.width} × ${item.height} px`}
                              >
                                <MaterialSymbol name="aspect_ratio" size={20} />
                                Resized
                              </span>
                            </>
                          ) : null}
                          <span className="work-item__specs-sep" aria-hidden="true">
                            ·
                          </span>
                          <span className="work-item__specs-meta">
                            {metadataLabel(completedResult.metadata)}
                          </span>
                        </div>

                        {compressionMode === "target-size" && targetBytes ? (
                          <p className="work-item__success" role="status">
                            <MaterialSymbol name="check_circle" size={20} filled />
                            {`Target met · ${formatBytes(completedResult.outputBytes)} of ${formatBytes(targetBytes)}`}
                          </p>
                        ) : null}

                        {completedResult.warnings.map((warning) => (
                          <p
                            className="work-item__warning"
                            key={warning.code}
                            role="status"
                          >
                            {warning.message}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <span className="work-item__actions">
                    {item.status === "ready" ? (
                      imageAction.status === "queued" ? (
                        <span className="work-item__chip">Queued</span>
                      ) : imageAction.status === "processing" ? (
                        <Button
                          onClick={() => cancelCompression(item.id)}
                          size="small"
                          variant="ghost"
                        >
                          Cancel
                        </Button>
                      ) : imageAction.status === "completed" ? (
                        <ButtonAnchor
                          aria-label={`Download ${formatName(imageAction.result.outputFormat)}`}
                          download={imageAction.result.outputName}
                          href={imageAction.downloadUrl}
                          iconOnly
                          size="small"
                          title={`Download ${formatName(imageAction.result.outputFormat)}`}
                        >
                          <MaterialSymbol name="download" size={20} />
                        </ButtonAnchor>
                      ) : (
                        <Button
                          disabled={actionsDisabled}
                          onClick={() => void compressImage(item)}
                          size="small"
                          variant="secondary"
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
                      variant="ghost"
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
        onOpenChange={(open) => {
          if (!open) setCompareItemId(null);
        }}
        open={Boolean(comparison)}
        showTitle={false}
        title={comparison ? `Compare ${comparison.item.name}` : "Compare images"}
      >
        {comparison
          ? (() => {
              const naturalWidth =
                comparison.action.result.outputDimensions.width ||
                comparison.item.width ||
                1;
              const naturalHeight =
                comparison.action.result.outputDimensions.height ||
                comparison.item.height ||
                1;
              const imageRatio = Number((naturalWidth / naturalHeight).toFixed(4));
              return (
                <div
                  className="file-compare__viewer"
                  style={{
                    aspectRatio: `${naturalWidth} / ${naturalHeight}`,
                    width: `min(92vw, 1120px, calc((82vh - 56px) * ${imageRatio}))`,
                  }}
                >
                  <div className="file-compare__layer file-compare__layer--optimized">
                    <Image
                      alt={`Optimized ${comparison.action.result.outputName}`}
                      fill
                      sizes="(max-width: 1200px) 94vw, 1120px"
                      src={comparison.action.downloadUrl}
                      unoptimized
                    />
                  </div>
                  <div
                    className="file-compare__layer file-compare__layer--original"
                    style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                  >
                    <Image
                      alt={`Original ${comparison.item.name}`}
                      fill
                      sizes="(max-width: 1200px) 94vw, 1120px"
                      src={comparison.item.previewUrl}
                      unoptimized
                    />
                  </div>
                  <span className="file-compare__label file-compare__label--original">
                    Original
                  </span>
                  <span className="file-compare__label file-compare__label--optimized">
                    Optimized
                  </span>
                  <div
                    aria-hidden="true"
                    className="file-compare__divider"
                    style={{ left: `${comparePosition}%` }}
                  >
                    <span className="file-compare__handle">
                      <MaterialSymbol name="drag_indicator" size={20} />
                    </span>
                  </div>
                  <input
                    aria-label="Reveal original image"
                    aria-valuetext={`${comparePosition}% original image visible`}
                    className="file-compare__range"
                    max={100}
                    min={0}
                    onChange={(event) =>
                      setComparePosition(Number(event.currentTarget.value))
                    }
                    type="range"
                    value={comparePosition}
                  />
                </div>
              );
            })()
          : null}
      </Dialog>
    </section>
  );
}
