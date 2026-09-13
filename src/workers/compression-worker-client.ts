import type {
  CompressionError,
  CompressionProgress,
  CompressionRequest,
  CompressionResult,
  CompressionRunOptions,
  CompressionService,
} from "@/features/compression";

import {
  isCompressionWorkerResponse,
  type CompressionWorkerCommand,
  type CompressionWorkerResponse,
} from "./compression-protocol";
import { CompressionWorkerError } from "./compression-worker-error";

interface PendingCompression {
  resolve: (result: CompressionResult) => void;
  reject: (error: CompressionWorkerError) => void;
  onProgress?: (progress: CompressionProgress) => void;
  signal?: AbortSignal;
  abortListener?: () => void;
}

interface PendingPing {
  resolve: () => void;
  reject: (error: CompressionWorkerError) => void;
  timeout: ReturnType<typeof setTimeout>;
}

interface ReadyWaiter {
  resolve: () => void;
  reject: (error: CompressionWorkerError) => void;
  timeout: ReturnType<typeof setTimeout>;
}

type WorkerFactory = () => Worker;

function createWorker() {
  return new Worker(new URL("./compression.worker.ts", import.meta.url), {
    name: "compress-by-url-worker",
    type: "module",
  });
}

function createRequestId() {
  return crypto.randomUUID();
}

export class CompressionWorkerClient implements CompressionService {
  private readonly worker: Worker;
  private readonly pending = new Map<string, PendingCompression>();
  private readonly pings = new Map<string, PendingPing>();
  private readonly readyWaiters = new Set<ReadyWaiter>();
  private ready = false;
  private disposed = false;
  private terminalError: CompressionWorkerError | null = null;

  constructor(workerFactory: WorkerFactory = createWorker) {
    this.worker = workerFactory();
    this.worker.addEventListener("message", this.handleMessage);
    this.worker.addEventListener("error", this.handleWorkerError);
    this.worker.addEventListener("messageerror", this.handleMessageError);
  }

  waitUntilReady(timeoutMs = 5_000) {
    if (this.ready) return Promise.resolve();
    if (this.terminalError) return Promise.reject(this.terminalError);
    if (this.disposed) return Promise.reject(this.disposedError());

    return new Promise<void>((resolve, reject) => {
      const waiter: ReadyWaiter = {
        reject,
        resolve,
        timeout: setTimeout(() => {
          this.readyWaiters.delete(waiter);
          reject(
            new CompressionWorkerError({
              code: "WORKER_UNAVAILABLE",
              message: "The compression worker did not become ready in time.",
            }),
          );
        }, timeoutMs),
      };
      this.readyWaiters.add(waiter);
    });
  }

  ping(timeoutMs = 2_000) {
    if (this.terminalError) return Promise.reject(this.terminalError);
    if (this.disposed) return Promise.reject(this.disposedError());
    const requestId = createRequestId();

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pings.delete(requestId);
        reject(
          new CompressionWorkerError({
            code: "WORKER_UNAVAILABLE",
            message: "The compression worker did not respond.",
          }),
        );
      }, timeoutMs);

      this.pings.set(requestId, { reject, resolve, timeout });
      try {
        this.post({ requestId, type: "ping" });
      } catch (cause) {
        clearTimeout(timeout);
        this.pings.delete(requestId);
        reject(this.postError(cause));
      }
    });
  }

  compress(request: CompressionRequest, options: CompressionRunOptions = {}) {
    if (this.terminalError) return Promise.reject(this.terminalError);
    if (this.disposed) return Promise.reject(this.disposedError());
    if (options.signal?.aborted) return Promise.reject(this.cancelledError());

    const requestId = createRequestId();

    return new Promise<CompressionResult>((resolve, reject) => {
      const pending: PendingCompression = {
        onProgress: options.onProgress,
        reject,
        resolve,
        signal: options.signal,
      };

      if (options.signal) {
        pending.abortListener = () => {
          this.post({ requestId, type: "cancel" });
          this.rejectPending(requestId, this.cancelledError());
        };
        options.signal.addEventListener("abort", pending.abortListener, { once: true });
      }

      this.pending.set(requestId, pending);
      try {
        this.post({ request, requestId, type: "compress" });
      } catch (cause) {
        this.rejectPending(requestId, this.postError(cause));
      }
    });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.worker.removeEventListener("message", this.handleMessage);
    this.worker.removeEventListener("error", this.handleWorkerError);
    this.worker.removeEventListener("messageerror", this.handleMessageError);
    this.worker.terminate();

    const error = this.terminalError ?? this.disposedError();
    for (const requestId of this.pending.keys()) this.rejectPending(requestId, error);
    for (const waiter of this.readyWaiters) {
      clearTimeout(waiter.timeout);
      waiter.reject(error);
    }
    this.readyWaiters.clear();
    for (const ping of this.pings.values()) {
      clearTimeout(ping.timeout);
      ping.reject(error);
    }
    this.pings.clear();
  }

  private readonly handleMessage = (event: MessageEvent<unknown>) => {
    if (!isCompressionWorkerResponse(event.data)) {
      this.failAll({
        code: "PROTOCOL_ERROR",
        message: "The compression worker returned an invalid message.",
      });
      return;
    }

    const message = event.data;
    if (message.type === "ready") {
      this.ready = true;
      for (const waiter of this.readyWaiters) {
        clearTimeout(waiter.timeout);
        waiter.resolve();
      }
      this.readyWaiters.clear();
      return;
    }

    if (message.type === "pong") {
      const ping = this.pings.get(message.requestId);
      if (!ping) return;
      clearTimeout(ping.timeout);
      this.pings.delete(message.requestId);
      ping.resolve();
      return;
    }

    this.handleRequestMessage(message);
  };

  private handleRequestMessage(
    message: Exclude<CompressionWorkerResponse, { type: "ready" } | { type: "pong" }>,
  ) {
    const pending = this.pending.get(message.requestId);
    if (!pending) return;

    if (message.type === "progress") {
      pending.onProgress?.(message.progress);
      return;
    }

    if (message.type === "completed") {
      this.cleanupPending(message.requestId);
      pending.resolve(message.result);
      return;
    }

    if (message.type === "failed") {
      this.rejectPending(message.requestId, new CompressionWorkerError(message.error));
      return;
    }

    this.rejectPending(message.requestId, this.cancelledError());
  }

  private readonly handleWorkerError = (event: ErrorEvent) => {
    event.preventDefault();
    this.failAll({
      cause: event.error,
      code: "WORKER_UNAVAILABLE",
      message: event.message || "The compression worker stopped unexpectedly.",
    });
  };

  private readonly handleMessageError = () => {
    this.failAll({
      code: "PROTOCOL_ERROR",
      message: "The browser could not read a compression worker message.",
    });
  };

  private post(message: CompressionWorkerCommand) {
    if (this.terminalError) throw this.terminalError;
    if (this.disposed) throw this.disposedError();
    this.worker.postMessage(message);
  }

  private cleanupPending(requestId: string) {
    const pending = this.pending.get(requestId);
    if (!pending) return;
    if (pending.signal && pending.abortListener) {
      pending.signal.removeEventListener("abort", pending.abortListener);
    }
    this.pending.delete(requestId);
  }

  private rejectPending(requestId: string, error: CompressionWorkerError) {
    const pending = this.pending.get(requestId);
    if (!pending) return;
    this.cleanupPending(requestId);
    pending.reject(error);
  }

  private failAll(error: CompressionError) {
    const workerError = new CompressionWorkerError(error);
    if (this.terminalError) return;
    this.terminalError = workerError;
    this.ready = false;
    this.worker.removeEventListener("message", this.handleMessage);
    this.worker.removeEventListener("error", this.handleWorkerError);
    this.worker.removeEventListener("messageerror", this.handleMessageError);
    this.worker.terminate();
    for (const requestId of this.pending.keys())
      this.rejectPending(requestId, workerError);
    for (const waiter of this.readyWaiters) {
      clearTimeout(waiter.timeout);
      waiter.reject(workerError);
    }
    this.readyWaiters.clear();
    for (const ping of this.pings.values()) {
      clearTimeout(ping.timeout);
      ping.reject(workerError);
    }
    this.pings.clear();
  }

  private postError(cause: unknown) {
    return new CompressionWorkerError({
      cause,
      code: "PROTOCOL_ERROR",
      message: "The browser could not send a message to the compression worker.",
    });
  }

  private cancelledError() {
    return new CompressionWorkerError({
      code: "CANCELLED",
      message: "Compression was cancelled.",
    });
  }

  private disposedError() {
    return new CompressionWorkerError({
      code: "WORKER_UNAVAILABLE",
      message: "The compression worker service has been disposed.",
    });
  }
}
