import {
  assertStaticImageResource,
  fetchPublicResource,
  HTML_CONTENT_TYPES,
  HTML_FETCH_BUDGET,
  PublicFetchError,
  STATIC_IMAGE_CONTENT_TYPES,
  type AddressPolicy,
  type PublicFetchResult,
} from "@compressbyurl/url-audit-core/network";
import {
  extractWebsiteScanManifest,
  type WebsiteImageCandidate,
} from "@compressbyurl/url-audit-core";
import sharp from "sharp";

import { SCHEMA_VERSION } from "./constants.js";
import {
  auditWebpageImagesOutputSchema,
  type AuditWebpageImagesInput,
  type AuditWebpageImagesOutput,
  type WebpageImage,
  type WebpageIssueCode,
} from "./webpage-audit-contracts.js";

const AUDIT_CONCURRENCY = 4;
const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
const TOTAL_IMAGE_MAX_BYTES = 64 * 1024 * 1024;
const DECODED_PIXEL_LIMIT = 40_000_000;
const OPERATION_TIMEOUT_MS = 30_000;

interface ImageMetadata {
  height: number | null;
  width: number | null;
}

export interface AuditWebpageDependencies {
  fetchResource?: typeof fetchPublicResource;
  readImageMetadata?: (bytes: Uint8Array) => Promise<ImageMetadata>;
}

interface ByteBudget {
  remaining: number;
}

function normalizedUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  return url.toString();
}

async function defaultReadImageMetadata(bytes: Uint8Array): Promise<ImageMetadata> {
  const metadata = await sharp(bytes, {
    failOn: "warning",
    limitInputPixels: DECODED_PIXEL_LIMIT,
    sequentialRead: true,
  }).metadata();
  return {
    height: metadata.height ?? null,
    width: metadata.width ?? null,
  };
}

function unavailable(
  candidate: WebsiteImageCandidate,
  code: string,
  message: string,
): WebpageImage {
  return {
    id: candidate.id,
    requestedUrl: candidate.url,
    finalUrl: null,
    sources: candidate.sources,
    alt: candidate.alt,
    declaredWidth: candidate.declaredWidth,
    declaredHeight: candidate.declaredHeight,
    bytes: null,
    width: null,
    height: null,
    contentType: null,
    format: null,
    status: "unavailable",
    issues:
      candidate.declaredWidth && candidate.declaredHeight ? [] : ["MISSING_DIMENSIONS"],
    recommendation: null,
    error: { code, message },
  };
}

function classifyIssues(
  candidate: WebsiteImageCandidate,
  measurement: {
    bytes: number;
    format: "jpeg" | "png" | "webp" | "avif";
    height: number | null;
    width: number | null;
  },
) {
  const issues: WebpageIssueCode[] = [];
  if (!candidate.declaredWidth || !candidate.declaredHeight) {
    issues.push("MISSING_DIMENSIONS");
  }
  if (
    (measurement.width ?? candidate.declaredWidth ?? 0) > 2_000 ||
    (measurement.height ?? candidate.declaredHeight ?? 0) > 2_000
  ) {
    issues.push("LARGE_DIMENSIONS");
  }
  if (measurement.bytes >= 250 * 1024) issues.push("HEAVY_FILE");
  if (measurement.format === "jpeg" || measurement.format === "png") {
    issues.push("MODERN_FORMAT_OPPORTUNITY");
  }
  if (
    measurement.width &&
    measurement.height &&
    candidate.declaredWidth &&
    candidate.declaredHeight &&
    (measurement.width > candidate.declaredWidth * 1.5 ||
      measurement.height > candidate.declaredHeight * 1.5)
  ) {
    issues.push("OVERSIZED_FOR_LAYOUT");
  }
  if (
    (measurement.format === "webp" || measurement.format === "avif") &&
    measurement.bytes < 150 * 1024
  ) {
    issues.push("ALREADY_LEAN");
  }
  return issues;
}

function recommendation(
  bytes: number,
  format: "jpeg" | "png" | "webp" | "avif",
  issues: WebpageIssueCode[],
) {
  const oversized = issues.includes("OVERSIZED_FOR_LAYOUT");
  const modernOpportunity = issues.includes("MODERN_FORMAT_OPPORTUNITY");
  const actionable = oversized || modernOpportunity || issues.includes("HEAVY_FILE");
  const action = !actionable
    ? "keep"
    : oversized && modernOpportunity
      ? "resize-and-convert"
      : modernOpportunity
        ? "convert"
        : "compress";
  const proposedFormat = modernOpportunity ? "webp" : format;
  const baseRate = { jpeg: 0.76, png: 0.58, webp: 0.9, avif: 0.95 }[format];
  const adjustedRate = bytes < 50 * 1024 ? 1 - (1 - baseRate) * 0.55 : baseRate;
  const targetBytes =
    action === "keep" ? bytes : Math.max(1, Math.round(bytes * adjustedRate));
  return {
    action,
    reasonCodes: issues,
    proposedFormat,
    targetBytes,
  } as const;
}

async function measureCandidate(
  candidate: WebsiteImageCandidate,
  deadline: number,
  signal: AbortSignal | undefined,
  budget: ByteBudget,
  dependencies: Required<AuditWebpageDependencies>,
): Promise<WebpageImage> {
  if (signal?.aborted) {
    throw new PublicFetchError("CANCELLED", "The request was cancelled.", 499);
  }
  const remainingMs = deadline - Date.now();
  if (remainingMs <= 0) {
    return unavailable(candidate, "TIMEOUT", "The audit operation timed out.");
  }
  if (budget.remaining < IMAGE_MAX_BYTES) {
    return unavailable(
      candidate,
      "OPERATION_BYTE_LIMIT",
      "The audit image-byte budget was reached.",
    );
  }

  budget.remaining -= IMAGE_MAX_BYTES;
  let consumedBytes = 0;
  try {
    const resource = await dependencies.fetchResource(candidate.url, {
      addressPolicy: "public-only",
      allowedContentTypes: STATIC_IMAGE_CONTENT_TYPES,
      contentTypeErrorMessage: "The candidate is not a supported static image.",
      maxBytes: IMAGE_MAX_BYTES,
      maxRedirects: 4,
      ...(signal ? { signal } : {}),
      timeoutMs: Math.min(8_000, remainingMs),
    });
    consumedBytes = resource.bytes.byteLength;
    const signature = assertStaticImageResource(resource.bytes, resource.contentType);

    let metadata: ImageMetadata;
    try {
      metadata = await dependencies.readImageMetadata(resource.bytes);
    } catch {
      return unavailable(
        candidate,
        "DECODE_FAILED",
        "The image metadata could not be decoded safely.",
      );
    }
    if (signal?.aborted) {
      throw new PublicFetchError("CANCELLED", "The request was cancelled.", 499);
    }
    if (Date.now() >= deadline) {
      return unavailable(candidate, "TIMEOUT", "The audit operation timed out.");
    }
    if (
      metadata.width &&
      metadata.height &&
      metadata.width * metadata.height > DECODED_PIXEL_LIMIT
    ) {
      return unavailable(
        candidate,
        "PIXEL_LIMIT_EXCEEDED",
        "The decoded image exceeds the pixel limit.",
      );
    }

    const measurement = {
      bytes: resource.bytes.byteLength,
      format: signature.format,
      height: metadata.height,
      width: metadata.width,
    };
    const issues = classifyIssues(candidate, measurement);
    return {
      id: candidate.id,
      requestedUrl: candidate.url,
      finalUrl: resource.finalUrl,
      sources: candidate.sources,
      alt: candidate.alt,
      declaredWidth: candidate.declaredWidth,
      declaredHeight: candidate.declaredHeight,
      bytes: measurement.bytes,
      width: measurement.width,
      height: measurement.height,
      contentType: signature.mimeType,
      format: signature.format,
      status: "measured",
      issues,
      recommendation: recommendation(measurement.bytes, signature.format, issues),
      error: null,
    };
  } catch (error) {
    if (error instanceof PublicFetchError) {
      if (error.code === "CANCELLED") throw error;
      return unavailable(candidate, error.code, error.message);
    }
    return unavailable(
      candidate,
      "FETCH_FAILED",
      "The image candidate could not be inspected safely.",
    );
  } finally {
    budget.remaining += IMAGE_MAX_BYTES - consumedBytes;
  }
}

async function mapConcurrent<T, R>(
  values: readonly T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
) {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= values.length) return;
      const value = values[index];
      if (value === undefined) return;
      results[index] = await mapper(value);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => worker()),
  );
  return results;
}

export async function auditWebpageImages(
  input: AuditWebpageImagesInput,
  options: { addressPolicy: AddressPolicy; signal?: AbortSignal },
  dependencies: AuditWebpageDependencies = {},
): Promise<AuditWebpageImagesOutput> {
  const fetchResource = dependencies.fetchResource ?? fetchPublicResource;
  const readImageMetadata = dependencies.readImageMetadata ?? defaultReadImageMetadata;
  const resolvedDependencies = { fetchResource, readImageMetadata };
  const requestedUrl = normalizedUrl(input.url);
  const deadline = Date.now() + OPERATION_TIMEOUT_MS;
  const page: PublicFetchResult = await fetchResource(requestedUrl, {
    addressPolicy: options.addressPolicy,
    allowedContentTypes: HTML_CONTENT_TYPES,
    contentTypeErrorMessage: "The URL did not return an HTML webpage.",
    ...HTML_FETCH_BUDGET,
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const manifest = extractWebsiteScanManifest(
    new TextDecoder().decode(page.bytes),
    page.finalUrl,
    input.maxImages,
  );
  const budget = { remaining: TOTAL_IMAGE_MAX_BYTES };
  const images = await mapConcurrent(
    manifest.candidates,
    AUDIT_CONCURRENCY,
    (candidate) =>
      measureCandidate(candidate, deadline, options.signal, budget, resolvedDependencies),
  );
  const measured = images.filter((image) => image.status === "measured");
  const knownBytes = measured.reduce((sum, image) => sum + (image.bytes ?? 0), 0);
  const potentialSavingsBytes =
    measured.length === 0
      ? null
      : measured.reduce(
          (sum, image) =>
            sum +
            Math.max(0, (image.bytes ?? 0) - (image.recommendation?.targetBytes ?? 0)),
          0,
        );
  const warnings: AuditWebpageImagesOutput["warnings"] = [];
  if (manifest.limits.truncated) {
    warnings.push({
      code: "CANDIDATES_TRUNCATED",
      message: `Only the first ${input.maxImages} unique image candidates were inspected.`,
    });
  }
  if (measured.length !== images.length) {
    warnings.push({
      code: "PARTIAL_RESULTS",
      message: "One or more image candidates could not be measured.",
    });
  }

  return auditWebpageImagesOutputSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    page: {
      requestedUrl,
      finalUrl: page.finalUrl,
      title: manifest.page.title,
    },
    summary: {
      totalFound: manifest.totalFound,
      reportedCount: images.length,
      measuredCount: measured.length,
      failedCount: images.length - measured.length,
      knownBytes,
      potentialSavingsBytes,
    },
    images,
    limits: {
      maxImages: input.maxImages,
      truncated: manifest.limits.truncated,
      concurrency: AUDIT_CONCURRENCY,
      pageMaxBytes: HTML_FETCH_BUDGET.maxBytes,
      imageMaxBytes: IMAGE_MAX_BYTES,
      totalImageMaxBytes: TOTAL_IMAGE_MAX_BYTES,
      decodedPixelLimit: DECODED_PIXEL_LIMIT,
      operationTimeoutMs: OPERATION_TIMEOUT_MS,
    },
    warnings,
  });
}
