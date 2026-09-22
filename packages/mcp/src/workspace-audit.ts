import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import { lstat, open, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";

import {
  assertStaticImageResource,
  PublicFetchError,
} from "@compressbyurl/url-audit-core/network";
import sharp from "sharp";

import { SCHEMA_VERSION } from "./constants.js";
import {
  auditWorkspaceImagesOutputSchema,
  type AuditWorkspaceImagesInput,
  type AuditWorkspaceImagesOutput,
  type OptimizationPlanItem,
  type WorkspaceImage,
  type WorkspaceIssueCode,
} from "./workspace-contracts.js";

const AUDIT_CONCURRENCY = 4;
const MAX_DEPTH = 20;
const MAX_DIRECTORY_ENTRIES = 10_000;
const MAX_SKIPPED_REPORTED = 1_000;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const TOTAL_SOURCE_MAX_BYTES = 256 * 1024 * 1024;
const DECODED_PIXEL_LIMIT = 40_000_000;

const MIME_BY_EXTENSION = new Map<
  string,
  "image/jpeg" | "image/png" | "image/webp" | "image/avif"
>([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
]);
const KNOWN_UNSUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".gif",
  ".svg",
  ".bmp",
  ".tif",
  ".tiff",
  ".ico",
]);
const WINDOWS_RESERVED_NAME = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;

export type WorkspaceAuditErrorCode =
  | "WORKSPACE_ROOT_REQUIRED"
  | "PATH_OUTSIDE_ROOT"
  | "PATH_ESCAPE"
  | "FILE_NOT_FOUND"
  | "INVALID_INPUT"
  | "CANCELLED";

export class WorkspaceAuditError extends Error {
  constructor(
    public readonly code: WorkspaceAuditErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "WorkspaceAuditError";
  }
}

export interface AuthorizedWorkspace {
  path: string;
  rootId: string;
}

interface Candidate {
  absolutePath: string;
  relativePath: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/avif";
}

interface SkippedItem {
  relativePath: string;
  code: string;
  message: string;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createOptimizationPlanId(
  rootId: string,
  items: readonly OptimizationPlanItem[],
) {
  return digest(JSON.stringify({ rootId, items }));
}

function pathIdentity(value: string) {
  const normalized = path.resolve(value);
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

export function configuredRootId(rootPath: string) {
  return digest(`workspace-root:${pathIdentity(rootPath)}`).slice(0, 16);
}

export function isWithin(parent: string, child: string) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function safeRelative(root: string, target: string) {
  const relative = path.relative(root, target);
  if (!relative || relative === ".") return ".";
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new WorkspaceAuditError(
      "PATH_ESCAPE",
      "A filesystem entry escaped the authorized workspace root.",
    );
  }
  return relative.split(path.sep).join("/");
}

export function assertSafeRelativeInput(value: string) {
  if (path.isAbsolute(value) || value.includes("\0")) {
    throw new WorkspaceAuditError(
      "PATH_OUTSIDE_ROOT",
      "The directory must be a workspace-relative path.",
    );
  }
  const segments = value.replaceAll("\\", "/").split("/");
  for (const segment of segments) {
    if (segment === "" || segment === ".") continue;
    if (
      segment === ".." ||
      segment.includes(":") ||
      WINDOWS_RESERVED_NAME.test(segment) ||
      /[. ]$/.test(segment)
    ) {
      throw new WorkspaceAuditError(
        "PATH_OUTSIDE_ROOT",
        "The directory contains an unsafe path segment.",
      );
    }
  }
}

async function existingDirectory(value: string) {
  try {
    const resolved = await realpath(value);
    const details = await stat(resolved);
    return details.isDirectory() ? resolved : null;
  } catch {
    return null;
  }
}

export async function resolveAuthorizedWorkspace(
  approvedRoots: readonly string[],
  clientRoots: readonly string[],
  requestedRootId?: string,
): Promise<AuthorizedWorkspace> {
  if (approvedRoots.length === 0) {
    throw new WorkspaceAuditError(
      "WORKSPACE_ROOT_REQUIRED",
      "A server-approved workspace root is required.",
    );
  }

  const approved = (
    await Promise.all(
      approvedRoots.map(async (configuredPath) => {
        const resolved = await existingDirectory(configuredPath);
        return resolved
          ? { path: resolved, rootId: configuredRootId(configuredPath) }
          : null;
      }),
    )
  ).filter((root): root is AuthorizedWorkspace => root !== null);
  const clients = (
    await Promise.all(clientRoots.map((root) => existingDirectory(root)))
  ).filter((root): root is string => root !== null);
  const hasClientRootConstraint = clientRoots.length > 0;

  const intersections: AuthorizedWorkspace[] = [];
  for (const approvedRoot of approved) {
    if (requestedRootId && approvedRoot.rootId !== requestedRootId) continue;
    if (!hasClientRootConstraint) {
      intersections.push(approvedRoot);
      continue;
    }
    for (const clientRoot of clients) {
      if (isWithin(approvedRoot.path, clientRoot)) {
        intersections.push({ path: clientRoot, rootId: approvedRoot.rootId });
      } else if (isWithin(clientRoot, approvedRoot.path)) {
        intersections.push(approvedRoot);
      }
    }
  }

  const unique = Array.from(
    new Map(
      intersections.map((root) => [`${root.rootId}:${pathIdentity(root.path)}`, root]),
    ).values(),
  ).sort((left, right) => left.path.localeCompare(right.path));
  const broadest = unique.filter(
    (candidate, index) =>
      !unique.some(
        (other, otherIndex) =>
          index !== otherIndex &&
          candidate.rootId === other.rootId &&
          isWithin(other.path, candidate.path) &&
          other.path !== candidate.path,
      ),
  );

  if (broadest.length === 0) {
    throw new WorkspaceAuditError(
      "WORKSPACE_ROOT_REQUIRED",
      hasClientRootConstraint
        ? "No MCP client root intersects a server-approved workspace root."
        : "No configured workspace root is available.",
    );
  }
  if (broadest.length > 1) {
    throw new WorkspaceAuditError(
      "INVALID_INPUT",
      "Multiple authorized roots are available; pass one configured rootId.",
    );
  }
  const selected = broadest[0];
  if (!selected) {
    throw new WorkspaceAuditError(
      "WORKSPACE_ROOT_REQUIRED",
      "No authorized workspace root is available.",
    );
  }
  return selected;
}

async function collectCandidates(
  scanRoot: string,
  reportingRoot: string,
  maxFiles: number,
  signal: AbortSignal | undefined,
) {
  const candidates: Candidate[] = [];
  const skipped: SkippedItem[] = [];
  let filesFound = 0;
  let entryCount = 0;
  let entryLimitReached = false;

  async function visit(directory: string, depth: number): Promise<void> {
    if (signal?.aborted) {
      throw new WorkspaceAuditError("CANCELLED", "The request was cancelled.");
    }
    if (depth > MAX_DEPTH) {
      skipped.push({
        relativePath: safeRelative(reportingRoot, directory),
        code: "DEPTH_LIMIT",
        message: "The directory depth limit was reached.",
      });
      return;
    }
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      skipped.push({
        relativePath: safeRelative(reportingRoot, directory),
        code: "INACCESSIBLE",
        message: "The directory could not be read.",
      });
      return;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      entryCount += 1;
      if (entryCount > MAX_DIRECTORY_ENTRIES) {
        entryLimitReached = true;
        return;
      }
      const absolutePath = path.join(directory, entry.name);
      const relativePath = safeRelative(reportingRoot, absolutePath);
      let details;
      try {
        details = await lstat(absolutePath);
      } catch {
        skipped.push({
          relativePath,
          code: "INACCESSIBLE",
          message: "The filesystem entry could not be inspected.",
        });
        continue;
      }
      if (details.isSymbolicLink()) {
        skipped.push({
          relativePath,
          code: "PATH_ESCAPE",
          message: "Symbolic links and junctions are not followed.",
        });
        continue;
      }
      if (details.isDirectory()) {
        const resolvedDirectory = await realpath(absolutePath).catch(() => null);
        if (!resolvedDirectory || !isWithin(scanRoot, resolvedDirectory)) {
          skipped.push({
            relativePath,
            code: "PATH_ESCAPE",
            message: "A directory resolved outside the authorized root.",
          });
          continue;
        }
        await visit(resolvedDirectory, depth + 1);
        if (entryLimitReached) return;
        continue;
      }
      const extension = path.extname(entry.name).toLowerCase();
      const mimeType = MIME_BY_EXTENSION.get(extension);
      if (!details.isFile()) {
        if (mimeType || KNOWN_UNSUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
          skipped.push({
            relativePath,
            code: "NOT_A_FILE",
            message: "The image-like entry is not a regular file.",
          });
        }
        continue;
      }
      if (!mimeType) {
        if (KNOWN_UNSUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
          skipped.push({
            relativePath,
            code: "UNSUPPORTED_FORMAT",
            message: "Only static JPEG, PNG, WebP, and AVIF images are supported.",
          });
        }
        continue;
      }
      filesFound += 1;
      if (candidates.length >= maxFiles) continue;
      candidates.push({ absolutePath, relativePath, mimeType });
    }
  }

  await visit(scanRoot, 0);
  return {
    candidates,
    entryLimitReached,
    filesFound,
    skipped,
    truncated: filesFound > candidates.length || entryLimitReached,
  };
}

function unavailableCandidate(
  candidate: Candidate,
  code: string,
  message: string,
): SkippedItem {
  return { relativePath: candidate.relativePath, code, message };
}

async function inspectCandidate(
  candidate: Candidate,
  scanRoot: string,
  signal: AbortSignal | undefined,
  reserveBytes: (size: number) => boolean,
): Promise<{ image?: WorkspaceImage; skipped?: SkippedItem }> {
  if (signal?.aborted) {
    throw new WorkspaceAuditError("CANCELLED", "The request was cancelled.");
  }
  let details;
  try {
    details = await stat(candidate.absolutePath);
  } catch {
    return {
      skipped: unavailableCandidate(
        candidate,
        "INACCESSIBLE",
        "The file could not be read.",
      ),
    };
  }
  if (!details.isFile()) {
    return {
      skipped: unavailableCandidate(
        candidate,
        "NOT_A_FILE",
        "The entry is not a regular file.",
      ),
    };
  }
  if (details.size <= 0) {
    return {
      skipped: unavailableCandidate(candidate, "EMPTY_FILE", "The image file is empty."),
    };
  }
  if (details.size > MAX_FILE_BYTES) {
    return {
      skipped: unavailableCandidate(
        candidate,
        "SOURCE_TOO_LARGE",
        "The image exceeds the per-file byte limit.",
      ),
    };
  }
  if (!reserveBytes(details.size)) {
    return {
      skipped: unavailableCandidate(
        candidate,
        "TOTAL_SOURCE_LIMIT",
        "The workspace audit source-byte limit was reached.",
      ),
    };
  }

  try {
    const resolvedFile = await realpath(candidate.absolutePath);
    if (!isWithin(scanRoot, resolvedFile)) {
      return {
        skipped: unavailableCandidate(
          candidate,
          "PATH_ESCAPE",
          "The file resolved outside the authorized root.",
        ),
      };
    }
    const noFollow = "O_NOFOLLOW" in fsConstants ? fsConstants.O_NOFOLLOW : 0;
    const handle = await open(candidate.absolutePath, fsConstants.O_RDONLY | noFollow);
    let bytes: Uint8Array;
    try {
      const openedDetails = await handle.stat();
      if (!openedDetails.isFile() || openedDetails.size !== details.size) {
        return {
          skipped: unavailableCandidate(
            candidate,
            "FILE_CHANGED",
            "The file changed while it was being inspected.",
          ),
        };
      }
      bytes = new Uint8Array(await handle.readFile());
      if (bytes.byteLength !== details.size || bytes.byteLength > MAX_FILE_BYTES) {
        return {
          skipped: unavailableCandidate(
            candidate,
            "FILE_CHANGED",
            "The file changed while it was being inspected.",
          ),
        };
      }
    } finally {
      await handle.close();
    }
    const signature = assertStaticImageResource(bytes, candidate.mimeType);
    const metadata = await sharp(bytes, {
      failOn: "warning",
      limitInputPixels: DECODED_PIXEL_LIMIT,
      sequentialRead: true,
    }).metadata();
    if (!metadata.width || !metadata.height) {
      return {
        skipped: unavailableCandidate(
          candidate,
          "DECODE_FAILED",
          "The image dimensions could not be decoded.",
        ),
      };
    }
    if (metadata.width * metadata.height > DECODED_PIXEL_LIMIT) {
      return {
        skipped: unavailableCandidate(
          candidate,
          "PIXEL_LIMIT_EXCEEDED",
          "The decoded image exceeds the pixel limit.",
        ),
      };
    }
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const issues: WorkspaceIssueCode[] = [];
    if (bytes.byteLength >= 250 * 1024) issues.push("LARGE_FILE");
    if (metadata.width > 2_000 || metadata.height > 2_000) {
      issues.push("LARGE_DIMENSIONS");
    }
    if (signature.format === "jpeg" || signature.format === "png") {
      issues.push("MODERN_FORMAT_OPPORTUNITY");
    }
    if (
      (signature.format === "webp" || signature.format === "avif") &&
      bytes.byteLength < 150 * 1024
    ) {
      issues.push("ALREADY_LEAN");
    }
    return {
      image: {
        id: digest(`workspace-image:${candidate.relativePath}`).slice(0, 24),
        relativePath: candidate.relativePath,
        bytes: bytes.byteLength,
        width: metadata.width,
        height: metadata.height,
        format: signature.format,
        contentType: signature.mimeType,
        sha256,
        duplicateOf: null,
        issues,
        proposal: null,
      },
    };
  } catch (error) {
    if (error instanceof PublicFetchError) {
      return { skipped: unavailableCandidate(candidate, error.code, error.message) };
    }
    return {
      skipped: unavailableCandidate(
        candidate,
        "DECODE_FAILED",
        "The image could not be decoded safely.",
      ),
    };
  }
}

async function mapConcurrent<T, R>(
  values: readonly T[],
  mapper: (value: T) => Promise<R>,
) {
  const results = new Array<R>(values.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      const value = values[index];
      if (value === undefined) return;
      results[index] = await mapper(value);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(AUDIT_CONCURRENCY, values.length) }, () => worker()),
  );
  return results;
}

function proposalFor(image: WorkspaceImage) {
  const actionable = image.issues.filter((issue) => issue !== "ALREADY_LEAN");
  if (actionable.length === 0 || image.issues.includes("DUPLICATE")) return null;
  const proposedFormat =
    image.format === "jpeg" || image.format === "png" ? "webp" : image.format;
  const rate = { jpeg: 0.76, png: 0.58, webp: 0.9, avif: 0.95 }[image.format];
  const stem = path.posix.basename(
    image.relativePath,
    path.posix.extname(image.relativePath),
  );
  const suffix = digest(image.relativePath).slice(0, 8);
  return {
    destination: `compressbyurl-output/${stem}.optimized-${suffix}.${proposedFormat}`,
    format: proposedFormat,
    mode: "target" as const,
    targetBytes: Math.max(1, Math.round(image.bytes * rate)),
    smartFit: image.issues.includes("LARGE_DIMENSIONS"),
    reasonCodes: actionable,
  };
}

export async function auditWorkspaceImages(
  input: AuditWorkspaceImagesInput,
  configuration: {
    approvedRoots: readonly string[];
    clientRoots: readonly string[];
    signal?: AbortSignal;
  },
): Promise<AuditWorkspaceImagesOutput> {
  assertSafeRelativeInput(input.directory);
  const workspace = await resolveAuthorizedWorkspace(
    configuration.approvedRoots,
    configuration.clientRoots,
    input.rootId,
  );
  const lexicalDirectory = path.resolve(workspace.path, input.directory);
  if (!isWithin(workspace.path, lexicalDirectory)) {
    throw new WorkspaceAuditError(
      "PATH_OUTSIDE_ROOT",
      "The requested directory is outside the authorized workspace root.",
    );
  }
  const scanRoot = await existingDirectory(lexicalDirectory);
  if (!scanRoot) {
    throw new WorkspaceAuditError(
      "FILE_NOT_FOUND",
      "The requested workspace directory was not found.",
    );
  }
  if (!isWithin(workspace.path, scanRoot)) {
    throw new WorkspaceAuditError(
      "PATH_ESCAPE",
      "The requested directory resolves outside the authorized workspace root.",
    );
  }

  const collection = await collectCandidates(
    scanRoot,
    workspace.path,
    input.maxFiles,
    configuration.signal,
  );
  let remainingSourceBytes = TOTAL_SOURCE_MAX_BYTES;
  const inspected = await mapConcurrent(collection.candidates, (candidate) =>
    inspectCandidate(candidate, scanRoot, configuration.signal, (size) => {
      if (size > remainingSourceBytes) return false;
      remainingSourceBytes -= size;
      return true;
    }),
  );
  const images = inspected.flatMap((result) => (result.image ? [result.image] : []));
  const allSkipped = [
    ...collection.skipped,
    ...inspected.flatMap((result) => (result.skipped ? [result.skipped] : [])),
  ].sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  const skipped = allSkipped.slice(0, MAX_SKIPPED_REPORTED);

  const firstByHash = new Map<string, string>();
  for (const image of images) {
    const duplicateOf = firstByHash.get(image.sha256);
    if (duplicateOf) {
      image.duplicateOf = duplicateOf;
      image.issues.push("DUPLICATE");
    } else {
      firstByHash.set(image.sha256, image.id);
    }
    image.proposal = proposalFor(image);
  }
  const planItems = images.flatMap((image) =>
    image.proposal
      ? [
          {
            id: image.id,
            source: {
              type: "workspace" as const,
              identifier: image.relativePath,
              sha256: image.sha256,
            },
            ...image.proposal,
          },
        ]
      : [],
  );
  const planId = createOptimizationPlanId(workspace.rootId, planItems);
  const warnings: AuditWorkspaceImagesOutput["warnings"] = [];
  if (collection.truncated) {
    warnings.push({
      code: "FILES_TRUNCATED",
      message: "The workspace scan reached a configured file or entry limit.",
    });
  }
  if (allSkipped.length > 0) {
    warnings.push({
      code: "FILES_SKIPPED",
      message: "One or more filesystem entries could not be inspected.",
    });
  }
  if (allSkipped.length > skipped.length) {
    warnings.push({
      code: "SKIPPED_RESULTS_TRUNCATED",
      message: `Only the first ${MAX_SKIPPED_REPORTED} skipped entries are reported.`,
    });
  }

  return auditWorkspaceImagesOutputSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    rootId: workspace.rootId,
    directory: safeRelative(workspace.path, scanRoot),
    summary: {
      filesFound: collection.filesFound,
      filesReported: images.length,
      supportedBytes: images.reduce((sum, image) => sum + image.bytes, 0),
      duplicateBytes: images.reduce(
        (sum, image) => sum + (image.duplicateOf ? image.bytes : 0),
        0,
      ),
      skippedCount: allSkipped.length,
    },
    images,
    plan: {
      schemaVersion: SCHEMA_VERSION,
      planId,
      rootId: workspace.rootId,
      createdFrom: "workspace",
      items: planItems,
    },
    skipped,
    limits: {
      maxFiles: input.maxFiles,
      truncated: collection.truncated,
      maxDepth: MAX_DEPTH,
      maxFileBytes: MAX_FILE_BYTES,
      totalSourceMaxBytes: TOTAL_SOURCE_MAX_BYTES,
      decodedPixelLimit: DECODED_PIXEL_LIMIT,
      concurrency: AUDIT_CONCURRENCY,
      maxSkippedReported: MAX_SKIPPED_REPORTED,
    },
    warnings,
  });
}
