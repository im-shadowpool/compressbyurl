import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { link, lstat, open, realpath, stat, unlink } from "node:fs/promises";
import path from "node:path";

import {
  assertStaticImageResource,
  fetchPublicResource,
  IMAGE_FETCH_BUDGET,
  STATIC_IMAGE_CONTENT_TYPES,
  type AddressPolicy,
} from "@compressbyurl/url-audit-core/network";
import sharp from "sharp";

import { SCHEMA_VERSION } from "./constants.js";
import {
  optimizeImageOutputSchema,
  type OptimizeImageInput,
  type OptimizeImageOutput,
} from "./optimize-image-contracts.js";
import {
  assertSafeRelativeInput,
  isWithin,
  resolveAuthorizedWorkspace,
  safeRelative,
  type AuthorizedWorkspace,
} from "./workspace-audit.js";

const DECODED_PIXEL_LIMIT = 40_000_000;
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 25 * 1024 * 1024;
const TARGET_QUALITY_FLOOR = 40;
const TARGET_QUALITY_CEILING = 92;
const MAX_ENCODE_ATTEMPTS = 12;

export type OptimizeImageErrorCode =
  | "INVALID_INPUT"
  | "FILE_NOT_FOUND"
  | "PATH_ESCAPE"
  | "DESTINATION_EXISTS"
  | "JPEG_BACKGROUND_REQUIRED"
  | "PIXEL_LIMIT_EXCEEDED"
  | "ANIMATED_IMAGE"
  | "ENCODE_FAILED"
  | "WRITE_FAILED"
  | "SOURCE_CHANGED"
  | "CANCELLED";

export class OptimizeImageError extends Error {
  constructor(
    public readonly code: OptimizeImageErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "OptimizeImageError";
  }
}

interface LoadedSource {
  bytes: Uint8Array;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
  identifier: string;
  type: "workspace" | "url";
}

interface EncodedCandidate {
  bytes: Uint8Array;
  format: "jpeg" | "png" | "webp" | "avif";
  height: number;
  quality: number;
  width: number;
}

function hash(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

function nodeErrorCode(error: unknown) {
  return error instanceof Error && "code" in error
    ? String((error as NodeJS.ErrnoException).code)
    : null;
}

function throwIfCancelled(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw new OptimizeImageError("CANCELLED", "The request was cancelled.");
  }
}

export async function assertNoSymlinkComponents(root: string, target: string) {
  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new OptimizeImageError(
      "PATH_ESCAPE",
      "The path is outside the authorized workspace root.",
    );
  }
  let current = root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const details = await lstat(current).catch((error: unknown) => {
      if (nodeErrorCode(error) === "ENOENT") {
        throw new OptimizeImageError("FILE_NOT_FOUND", "A required path was not found.");
      }
      throw new OptimizeImageError(
        "PATH_ESCAPE",
        "A filesystem path component could not be validated.",
      );
    });
    if (details.isSymbolicLink()) {
      throw new OptimizeImageError(
        "PATH_ESCAPE",
        "Symbolic links and junctions are not allowed in source or destination paths.",
      );
    }
  }
}

async function readWorkspaceSource(workspace: AuthorizedWorkspace, relativePath: string) {
  assertSafeRelativeInput(relativePath);
  const lexicalPath = path.resolve(workspace.path, relativePath);
  if (!isWithin(workspace.path, lexicalPath)) {
    throw new OptimizeImageError(
      "PATH_ESCAPE",
      "The source path is outside the authorized workspace root.",
    );
  }
  await assertNoSymlinkComponents(workspace.path, lexicalPath);
  const resolvedPath = await realpath(lexicalPath).catch(() => {
    throw new OptimizeImageError("FILE_NOT_FOUND", "The source image was not found.");
  });
  if (!isWithin(workspace.path, resolvedPath)) {
    throw new OptimizeImageError(
      "PATH_ESCAPE",
      "The source path resolves outside the authorized workspace root.",
    );
  }
  const details = await stat(resolvedPath);
  if (!details.isFile()) {
    throw new OptimizeImageError("FILE_NOT_FOUND", "The source is not a regular file.");
  }
  if (details.size <= 0 || details.size > MAX_SOURCE_BYTES) {
    throw new OptimizeImageError(
      "INVALID_INPUT",
      "The source image is empty or exceeds the source byte limit.",
    );
  }
  const contentType = new Map<
    string,
    "image/jpeg" | "image/png" | "image/webp" | "image/avif"
  >([
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".webp", "image/webp"],
    [".avif", "image/avif"],
  ]).get(path.extname(resolvedPath).toLowerCase());
  if (!contentType) {
    throw new OptimizeImageError(
      "INVALID_INPUT",
      "The workspace source extension is not supported.",
    );
  }
  const noFollow = "O_NOFOLLOW" in fsConstants ? fsConstants.O_NOFOLLOW : 0;
  const handle = await open(resolvedPath, fsConstants.O_RDONLY | noFollow);
  try {
    const openedDetails = await handle.stat();
    if (!openedDetails.isFile() || openedDetails.size !== details.size) {
      throw new OptimizeImageError(
        "INVALID_INPUT",
        "The source image changed while it was being read.",
      );
    }
    const bytes = new Uint8Array(await handle.readFile());
    if (bytes.byteLength !== details.size || bytes.byteLength > MAX_SOURCE_BYTES) {
      throw new OptimizeImageError(
        "INVALID_INPUT",
        "The source image changed while it was being read.",
      );
    }
    return {
      bytes,
      contentType,
      identifier: safeRelative(workspace.path, resolvedPath),
      type: "workspace" as const,
    };
  } finally {
    await handle.close();
  }
}

async function loadSource(
  input: OptimizeImageInput,
  workspace: AuthorizedWorkspace,
  addressPolicy: AddressPolicy,
  signal: AbortSignal | undefined,
): Promise<LoadedSource> {
  if (input.source.type === "workspace") {
    return readWorkspaceSource(workspace, input.source.path);
  }
  const resource = await fetchPublicResource(input.source.url, {
    addressPolicy,
    allowedContentTypes: STATIC_IMAGE_CONTENT_TYPES,
    contentTypeErrorMessage: "The URL did not return a supported static image.",
    ...IMAGE_FETCH_BUDGET,
    ...(signal ? { signal } : {}),
  });
  assertStaticImageResource(resource.bytes, resource.contentType);
  return {
    bytes: resource.bytes,
    contentType: resource.contentType as LoadedSource["contentType"],
    identifier: resource.finalUrl,
    type: "url",
  };
}

function expectedExtensions(format: "jpeg" | "png" | "webp" | "avif") {
  return format === "jpeg" ? new Set([".jpg", ".jpeg"]) : new Set([`.${format}`]);
}

async function validateDestination(
  workspace: AuthorizedWorkspace,
  destination: string,
  format: "jpeg" | "png" | "webp" | "avif",
) {
  assertSafeRelativeInput(destination);
  if (!expectedExtensions(format).has(path.extname(destination).toLowerCase())) {
    throw new OptimizeImageError(
      "INVALID_INPUT",
      "The destination extension must match the requested output format.",
    );
  }
  const absolutePath = path.resolve(workspace.path, destination);
  if (!isWithin(workspace.path, absolutePath)) {
    throw new OptimizeImageError(
      "PATH_ESCAPE",
      "The destination is outside the authorized workspace root.",
    );
  }
  const parent = path.dirname(absolutePath);
  await assertNoSymlinkComponents(workspace.path, parent);
  const resolvedParent = await realpath(parent).catch(() => {
    throw new OptimizeImageError(
      "FILE_NOT_FOUND",
      "The destination directory does not exist.",
    );
  });
  if (!isWithin(workspace.path, resolvedParent)) {
    throw new OptimizeImageError(
      "PATH_ESCAPE",
      "The destination directory resolves outside the authorized root.",
    );
  }
  try {
    await lstat(absolutePath);
    throw new OptimizeImageError(
      "DESTINATION_EXISTS",
      "The destination already exists and will not be overwritten.",
    );
  } catch (error) {
    if (error instanceof OptimizeImageError) throw error;
    if (nodeErrorCode(error) !== "ENOENT") {
      throw new OptimizeImageError(
        "WRITE_FAILED",
        "The destination could not be validated safely.",
      );
    }
  }
  return { absolutePath, relativePath: safeRelative(workspace.path, absolutePath) };
}

function orientedDimensions(
  metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>,
) {
  if (!metadata.width || !metadata.height) {
    throw new OptimizeImageError(
      "ENCODE_FAILED",
      "The source image dimensions could not be decoded.",
    );
  }
  const swap = metadata.orientation !== undefined && metadata.orientation >= 5;
  return swap
    ? { width: metadata.height, height: metadata.width }
    : { width: metadata.width, height: metadata.height };
}

async function encode(
  sourceBytes: Uint8Array,
  format: "jpeg" | "png" | "webp" | "avif",
  quality: number,
  options: {
    width?: number;
    height?: number;
    flattenBackground?: string;
  },
): Promise<EncodedCandidate> {
  let pipeline = sharp(sourceBytes, {
    failOn: "warning",
    limitInputPixels: DECODED_PIXEL_LIMIT,
    sequentialRead: true,
  }).rotate();
  if (options.width !== undefined || options.height !== undefined) {
    pipeline = pipeline.resize({
      width: options.width,
      height: options.height,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  if (format === "jpeg") {
    if (options.flattenBackground) {
      pipeline = pipeline.flatten({ background: options.flattenBackground });
    }
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (format === "png") {
    pipeline = pipeline.png({
      palette: true,
      quality,
      compressionLevel: 9,
      effort: 7,
    });
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality, effort: 5 });
  } else {
    pipeline = pipeline.avif({ quality, effort: 5 });
  }
  const bytes = new Uint8Array(await pipeline.toBuffer());
  if (bytes.byteLength <= 0 || bytes.byteLength > MAX_OUTPUT_BYTES) {
    throw new OptimizeImageError(
      "ENCODE_FAILED",
      "The encoded image is empty or exceeds the output byte limit.",
    );
  }
  const signature = assertStaticImageResource(
    bytes,
    {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      avif: "image/avif",
    }[format],
  );
  if (signature.format !== format) {
    throw new OptimizeImageError(
      "ENCODE_FAILED",
      "The encoder returned an unexpected output format.",
    );
  }
  const metadata = await sharp(bytes, {
    failOn: "warning",
    limitInputPixels: DECODED_PIXEL_LIMIT,
  }).metadata();
  if (!metadata.width || !metadata.height) {
    throw new OptimizeImageError(
      "ENCODE_FAILED",
      "The encoded image dimensions could not be verified.",
    );
  }
  return {
    bytes,
    format,
    height: metadata.height,
    quality,
    width: metadata.width,
  };
}

async function targetSearch(
  sourceBytes: Uint8Array,
  format: "jpeg" | "png" | "webp" | "avif",
  targetBytes: number,
  options: {
    width?: number;
    height?: number;
    flattenBackground?: string;
    smartFit: boolean;
    signal?: AbortSignal;
  },
) {
  let attempts = 0;
  const make = async (
    quality: number,
    width = options.width,
    height = options.height,
  ) => {
    throwIfCancelled(options.signal);
    if (attempts >= MAX_ENCODE_ATTEMPTS) {
      throw new OptimizeImageError(
        "ENCODE_FAILED",
        "The encoder attempt limit was reached.",
      );
    }
    attempts += 1;
    return encode(sourceBytes, format, quality, {
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
      ...(options.flattenBackground
        ? { flattenBackground: options.flattenBackground }
        : {}),
    });
  };

  const high = await make(TARGET_QUALITY_CEILING);
  if (high.bytes.byteLength <= targetBytes) {
    return { candidate: high, attempts, targetMet: true };
  }
  let smallest = high;
  let low = await make(TARGET_QUALITY_FLOOR);
  if (low.bytes.byteLength < smallest.bytes.byteLength) smallest = low;

  if (low.bytes.byteLength <= targetBytes) {
    let best = low;
    let lowQuality = TARGET_QUALITY_FLOOR;
    let highQuality = TARGET_QUALITY_CEILING;
    while (attempts < 10 && highQuality - lowQuality > 1) {
      const quality = Math.floor((lowQuality + highQuality) / 2);
      const candidate = await make(quality);
      if (candidate.bytes.byteLength <= targetBytes) {
        best = candidate;
        lowQuality = quality;
      } else {
        highQuality = quality;
      }
    }
    return { candidate: best, attempts, targetMet: true };
  }

  if (options.smartFit) {
    let width = low.width;
    let height = low.height;
    while (attempts < MAX_ENCODE_ATTEMPTS && (width > 1 || height > 1)) {
      const ratio = Math.sqrt(targetBytes / low.bytes.byteLength) * 0.92;
      const scale = Math.min(0.9, Math.max(0.25, ratio));
      const nextWidth = Math.max(1, Math.floor(width * scale));
      const nextHeight = Math.max(1, Math.floor(height * scale));
      if (nextWidth === width && nextHeight === height) break;
      width = nextWidth;
      height = nextHeight;
      low = await make(TARGET_QUALITY_FLOOR, width, height);
      if (low.bytes.byteLength < smallest.bytes.byteLength) smallest = low;
      if (low.bytes.byteLength <= targetBytes) {
        let best = low;
        let lowQuality = TARGET_QUALITY_FLOOR;
        let highQuality = TARGET_QUALITY_CEILING;
        while (attempts < MAX_ENCODE_ATTEMPTS && highQuality - lowQuality > 1) {
          const quality = Math.floor((lowQuality + highQuality) / 2);
          const candidate = await make(quality, width, height);
          if (candidate.bytes.byteLength <= targetBytes) {
            best = candidate;
            lowQuality = quality;
          } else {
            highQuality = quality;
          }
        }
        return { candidate: best, attempts, targetMet: true };
      }
    }
  }
  return { candidate: smallest, attempts, targetMet: false };
}

export async function commitExclusive(
  destination: string,
  bytes: Uint8Array,
  signal: AbortSignal | undefined,
) {
  const temporary = path.join(
    path.dirname(destination),
    `.${path.basename(destination)}.compressbyurl-${randomUUID()}.tmp`,
  );
  let temporaryCreated = false;
  try {
    const handle = await open(temporary, "wx", 0o600);
    temporaryCreated = true;
    try {
      await handle.writeFile(bytes);
      await handle.sync();
    } finally {
      await handle.close();
    }
    throwIfCancelled(signal);
    try {
      await link(temporary, destination);
    } catch (error) {
      if (nodeErrorCode(error) === "EEXIST") {
        throw new OptimizeImageError(
          "DESTINATION_EXISTS",
          "The destination already exists and will not be overwritten.",
        );
      }
      throw new OptimizeImageError(
        "WRITE_FAILED",
        "The optimized image could not be committed atomically.",
      );
    }
  } finally {
    if (temporaryCreated) await unlink(temporary).catch(() => undefined);
  }
}

export async function optimizeImage(
  input: OptimizeImageInput,
  configuration: {
    addressPolicy: AddressPolicy;
    approvedRoots: readonly string[];
    clientRoots: readonly string[];
    expectedSourceSha256?: string;
    signal?: AbortSignal;
  },
): Promise<OptimizeImageOutput> {
  throwIfCancelled(configuration.signal);
  const workspace = await resolveAuthorizedWorkspace(
    configuration.approvedRoots,
    configuration.clientRoots,
    input.rootId,
  );
  const destination = await validateDestination(
    workspace,
    input.destination,
    input.format,
  );
  const source = await loadSource(
    input,
    workspace,
    configuration.addressPolicy,
    configuration.signal,
  );
  throwIfCancelled(configuration.signal);
  const sourceSha256 = hash(source.bytes);
  if (
    configuration.expectedSourceSha256 !== undefined &&
    sourceSha256 !== configuration.expectedSourceSha256
  ) {
    throw new OptimizeImageError(
      "SOURCE_CHANGED",
      "The source image no longer matches the hash recorded in the plan.",
    );
  }
  const sourceSignature = assertStaticImageResource(source.bytes, source.contentType);
  const sourceMetadata = await sharp(source.bytes, {
    failOn: "warning",
    limitInputPixels: DECODED_PIXEL_LIMIT,
    sequentialRead: true,
  }).metadata();
  if ((sourceMetadata.pages ?? 1) > 1) {
    throw new OptimizeImageError("ANIMATED_IMAGE", "Animated images are not supported.");
  }
  const originalDimensions = orientedDimensions(sourceMetadata);
  if (originalDimensions.width * originalDimensions.height > DECODED_PIXEL_LIMIT) {
    throw new OptimizeImageError(
      "PIXEL_LIMIT_EXCEEDED",
      "The decoded image exceeds the pixel limit.",
    );
  }
  if (input.format === "jpeg" && sourceMetadata.hasAlpha && !input.jpegBackground) {
    throw new OptimizeImageError(
      "JPEG_BACKGROUND_REQUIRED",
      "A six-digit jpegBackground is required when converting transparency to JPEG.",
    );
  }

  const bounds = input.smartFit
    ? {
        ...(input.maxWidth !== undefined ? { width: input.maxWidth } : {}),
        ...(input.maxHeight !== undefined ? { height: input.maxHeight } : {}),
      }
    : {};
  let optimized: EncodedCandidate;
  let attempts: number;
  let targetMet: boolean | null;
  if (input.mode === "quality") {
    optimized = await encode(source.bytes, input.format, input.quality, {
      ...bounds,
      ...(input.jpegBackground ? { flattenBackground: input.jpegBackground } : {}),
    });
    attempts = 1;
    targetMet = null;
  } else {
    const searched = await targetSearch(source.bytes, input.format, input.targetBytes, {
      ...bounds,
      smartFit: input.smartFit,
      ...(input.jpegBackground ? { flattenBackground: input.jpegBackground } : {}),
      ...(configuration.signal ? { signal: configuration.signal } : {}),
    });
    optimized = searched.candidate;
    attempts = searched.attempts;
    targetMet = searched.targetMet;
  }
  throwIfCancelled(configuration.signal);
  const savedBytes = Math.max(0, source.bytes.byteLength - optimized.bytes.byteLength);
  const warnings: OptimizeImageOutput["warnings"] = [];
  if (input.mode === "target" && !targetMet) {
    warnings.push({
      code: "TARGET_UNREACHABLE",
      message: "The byte target was not reachable within the configured safety limits.",
    });
  }
  if (optimized.bytes.byteLength >= source.bytes.byteLength) {
    warnings.push({
      code: "OUTPUT_NOT_SMALLER",
      message: "The optimized output is not smaller than the source image.",
    });
  }

  const output = optimizeImageOutputSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    source: { type: source.type, identifier: source.identifier },
    original: {
      bytes: source.bytes.byteLength,
      width: originalDimensions.width,
      height: originalDimensions.height,
      format: sourceSignature.format,
      sha256: sourceSha256,
    },
    optimized: {
      bytes: optimized.bytes.byteLength,
      width: optimized.width,
      height: optimized.height,
      format: optimized.format,
      sha256: hash(optimized.bytes),
      quality: optimized.quality,
    },
    target: {
      requestedBytes: input.mode === "target" ? input.targetBytes : null,
      met: targetMet,
    },
    savedBytes,
    savingsPercent: Number(((savedBytes / source.bytes.byteLength) * 100).toFixed(2)),
    destination: destination.relativePath,
    settings: {
      smartFit: input.smartFit,
      maxWidth: input.maxWidth ?? null,
      maxHeight: input.maxHeight ?? null,
      jpegBackground: input.jpegBackground ?? null,
      metadataStripped: true,
      orientationNormalized: true,
      attempts,
      qualityFloor: input.mode === "target" ? TARGET_QUALITY_FLOOR : input.quality,
    },
    encoder: { name: "sharp", version: sharp.versions.sharp },
    warnings,
  });
  await commitExclusive(destination.absolutePath, optimized.bytes, configuration.signal);
  return output;
}
