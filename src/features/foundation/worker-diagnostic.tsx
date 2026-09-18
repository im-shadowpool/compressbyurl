"use client";

import { useEffect, useState } from "react";

import { MaterialSymbol } from "@/components/icons";
import { Card } from "@/components/ui";
import { createDefaultCompressionSettings } from "@/features/compression";
import { CompressionWorkerClient, isCompressionWorkerError } from "@/workers";

type DiagnosticState =
  | { status: "checking" }
  | { status: "ready"; targetBytes: number }
  | { status: "failed"; message: string };

async function verifyProtocol(client: CompressionWorkerClient) {
  const request = {
    settings: createDefaultCompressionSettings(),
    source: {
      blob: new Blob(["worker diagnostic"], { type: "image/png" }),
      dimensions: { height: 1, width: 1 },
      format: "png" as const,
      id: "worker-diagnostic",
      mime: "image/png" as const,
      name: "worker-diagnostic.png",
    },
  };
  let progressReceived = false;

  try {
    await client.compress(request, {
      onProgress: () => {
        progressReceived = true;
      },
    });
    throw new Error("The placeholder worker unexpectedly completed an encode.");
  } catch (error) {
    if (
      !isCompressionWorkerError(error) ||
      error.code === "CANCELLED" ||
      !progressReceived
    ) {
      throw error;
    }
  }

  const controller = new AbortController();
  const cancellation = client.compress(request, { signal: controller.signal });
  controller.abort();

  try {
    await cancellation;
    throw new Error("The cancelled request unexpectedly completed.");
  } catch (error) {
    if (!isCompressionWorkerError(error) || error.code !== "CANCELLED") throw error;
  }
}

async function verifyTargetSizeSearch(client: CompressionWorkerClient) {
  const response = await fetch("/media/compression-flow.png");
  if (!response.ok) throw new Error("The target-size fixture could not be loaded.");
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const dimensions = { height: bitmap.height, width: bitmap.width };
  bitmap.close();
  const baseRequest = {
    settings: {
      ...createDefaultCompressionSettings(),
      allowDimensionReduction: false,
      mode: "target-size" as const,
      outputFormat: "webp" as const,
      targetBytes: 100 * 1024,
    },
    source: {
      blob,
      dimensions,
      format: "png" as const,
      id: "target-size-diagnostic",
      mime: "image/png" as const,
      name: "target-size-diagnostic.png",
    },
  };
  const result = await client.compress(baseRequest);
  if (result.outputBytes > baseRequest.settings.targetBytes) {
    throw new Error("The target-size search returned an oversized result.");
  }

  try {
    await client.compress({
      ...baseRequest,
      settings: { ...baseRequest.settings, targetBytes: 1 },
    });
    throw new Error("An unreachable target unexpectedly succeeded.");
  } catch (error) {
    if (!isCompressionWorkerError(error) || error.code !== "TARGET_UNREACHABLE") {
      throw error;
    }
  }

  return result.outputBytes;
}

async function verifyMetadataPrivacy(client: CompressionWorkerClient) {
  const canvas = new OffscreenCanvas(8, 8);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The metadata diagnostic canvas is unavailable.");
  context.fillStyle = "#ab9ff2";
  context.fillRect(0, 0, 8, 8);
  const cleanJpeg = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.8 });
  const markerText = "Exif\0\0GPSLatitude=12.9716;GPSLongitude=77.5946";
  const payload = new TextEncoder().encode(markerText);
  const segmentLength = payload.length + 2;
  const segment = new Uint8Array(payload.length + 4);
  segment.set([0xff, 0xe1, segmentLength >> 8, segmentLength & 0xff]);
  segment.set(payload, 4);
  const source = new Blob([cleanJpeg.slice(0, 2), segment, cleanJpeg.slice(2)], {
    type: "image/jpeg",
  });
  const settings = createDefaultCompressionSettings();
  const request = {
    settings: { ...settings, outputFormat: "jpeg" as const },
    source: {
      blob: source,
      dimensions: { height: 8, width: 8 },
      format: "jpeg" as const,
      id: "metadata-diagnostic",
      mime: "image/jpeg" as const,
      name: "metadata-diagnostic.jpg",
    },
  };
  const stripped = await client.compress(request);
  const strippedText = new TextDecoder("latin1").decode(
    await stripped.blob.arrayBuffer(),
  );
  if (stripped.metadata !== "stripped" || strippedText.includes("GPSLatitude")) {
    throw new Error("GPS metadata was not removed by the default privacy path.");
  }

  const preserved = await client.compress({
    ...request,
    settings: { ...request.settings, stripMetadata: false },
  });
  const preservedText = new TextDecoder("latin1").decode(
    await preserved.blob.arrayBuffer(),
  );
  if (preserved.metadata !== "preserved" || !preservedText.includes("GPSLatitude")) {
    throw new Error("JPEG metadata preservation could not be verified.");
  }
}

export function WorkerDiagnostic() {
  const [state, setState] = useState<DiagnosticState>({ status: "checking" });

  useEffect(() => {
    const client = new CompressionWorkerClient();
    let active = true;

    void client
      .waitUntilReady()
      .then(() => client.ping())
      .then(() => verifyProtocol(client))
      .then(() => verifyTargetSizeSearch(client))
      .then(async (targetBytes) => {
        await verifyMetadataPrivacy(client);
        if (active) setState({ status: "ready", targetBytes });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          message: isCompressionWorkerError(error)
            ? error.message
            : "The worker diagnostic could not complete.",
          status: "failed",
        });
      });

    return () => {
      active = false;
      client.dispose();
    };
  }, []);

  return (
    <Card className="worker-diagnostic" padding="default">
      <MaterialSymbol
        filled={state.status === "ready"}
        name={
          state.status === "checking"
            ? "progress_activity"
            : state.status === "ready"
              ? "check_circle"
              : "error"
        }
        size={24}
      />
      <div aria-live="polite">
        <h1>Compression worker</h1>
        <p>
          {state.status === "checking"
            ? "Starting the browser worker and checking its protocol."
            : state.status === "ready"
              ? `Worker ready. Target search returned ${Math.ceil(state.targetBytes / 1024)} KB under a 100 KB limit, rejected an unreachable target, stripped GPS by default, and preserved opted-in JPEG metadata.`
              : state.message}
        </p>
      </div>
    </Card>
  );
}
