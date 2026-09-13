import type {
  CompressionError,
  CompressionProgress,
  CompressionRequest,
  CompressionResult,
} from "@/features/compression";

export type SerializableCompressionError = Omit<CompressionError, "cause">;

export type CompressionWorkerCommand =
  | { type: "compress"; requestId: string; request: CompressionRequest }
  | { type: "cancel"; requestId: string }
  | { type: "ping"; requestId: string };

export type CompressionWorkerResponse =
  | { type: "ready" }
  | { type: "pong"; requestId: string }
  | { type: "progress"; requestId: string; progress: CompressionProgress }
  | { type: "completed"; requestId: string; result: CompressionResult }
  | { type: "failed"; requestId: string; error: SerializableCompressionError }
  | { type: "cancelled"; requestId: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isCompressionWorkerCommand(
  value: unknown,
): value is CompressionWorkerCommand {
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (value.type === "ping" || value.type === "cancel") {
    return typeof value.requestId === "string";
  }
  return (
    value.type === "compress" &&
    typeof value.requestId === "string" &&
    isRecord(value.request)
  );
}

export function isCompressionWorkerResponse(
  value: unknown,
): value is CompressionWorkerResponse {
  if (!isRecord(value) || typeof value.type !== "string") return false;
  if (value.type === "ready") return true;
  if (typeof value.requestId !== "string") return false;

  if (value.type === "pong" || value.type === "cancelled") return true;
  if (value.type === "progress") return isRecord(value.progress);
  if (value.type === "completed") return isRecord(value.result);
  if (value.type === "failed") {
    return (
      isRecord(value.error) &&
      typeof value.error.code === "string" &&
      typeof value.error.message === "string"
    );
  }

  return false;
}
