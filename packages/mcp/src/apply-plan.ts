import { lstat, mkdir, realpath } from "node:fs/promises";
import path from "node:path";

import type { AddressPolicy } from "@compressbyurl/url-audit-core/network";

import {
  applyOptimizationPlanOutputSchema,
  type ApplyOptimizationPlanInput,
  type ApplyOptimizationPlanOutput,
  type ApplyPlanItemResult,
} from "./apply-plan-contracts.js";
import { SCHEMA_VERSION } from "./constants.js";
import {
  assertNoSymlinkComponents,
  commitExclusive,
  optimizeImage,
  OptimizeImageError,
} from "./optimize-image.js";
import {
  assertSafeRelativeInput,
  createOptimizationPlanId,
  isWithin,
  resolveAuthorizedWorkspace,
  safeRelative,
  WorkspaceAuditError,
  type AuthorizedWorkspace,
} from "./workspace-audit.js";
import type { OptimizationPlanItem } from "./workspace-contracts.js";

const APPLY_CONCURRENCY = 2;
const MAX_PLAN_ITEMS = 1_000;
const MANIFEST_NAME = "replacement-manifest.json";

export type ApplyPlanErrorCode =
  "INVALID_PLAN" | "DESTINATION_EXISTS" | "PATH_ESCAPE" | "WRITE_FAILED";

export class ApplyPlanError extends Error {
  constructor(
    public readonly code: ApplyPlanErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApplyPlanError";
  }
}

function nodeErrorCode(error: unknown) {
  return error instanceof Error && "code" in error
    ? String((error as NodeJS.ErrnoException).code)
    : null;
}

function canonicalRelative(workspace: AuthorizedWorkspace, value: string) {
  assertSafeRelativeInput(value);
  const absolutePath = path.resolve(workspace.path, value);
  if (!isWithin(workspace.path, absolutePath)) {
    throw new ApplyPlanError(
      "PATH_ESCAPE",
      "A plan path is outside the authorized workspace root.",
    );
  }
  return {
    absolutePath,
    relativePath: safeRelative(workspace.path, absolutePath),
  };
}

function validatePlan(input: ApplyOptimizationPlanInput, workspace: AuthorizedWorkspace) {
  const { plan } = input;
  if (plan.rootId !== workspace.rootId) {
    throw new ApplyPlanError(
      "INVALID_PLAN",
      "The plan root does not match the authorized workspace root.",
    );
  }
  if (plan.items.length > MAX_PLAN_ITEMS) {
    throw new ApplyPlanError(
      "INVALID_PLAN",
      `The plan exceeds the ${MAX_PLAN_ITEMS}-item application limit.`,
    );
  }
  const expectedPlanId = createOptimizationPlanId(plan.rootId, plan.items);
  if (plan.planId !== expectedPlanId) {
    throw new ApplyPlanError(
      "INVALID_PLAN",
      "The plan ID does not match its ordered audit-plan content.",
    );
  }

  const outputDirectory = canonicalRelative(workspace, input.outputDirectory);
  if (outputDirectory.relativePath === ".") {
    throw new ApplyPlanError(
      "INVALID_PLAN",
      "The output directory must be a dedicated workspace subdirectory.",
    );
  }
  const itemIds = new Set<string>();
  const destinations = new Set<string>();
  const sources = new Set<string>();
  for (const item of plan.items) {
    const source = canonicalRelative(workspace, item.source.identifier);
    const destination = canonicalRelative(workspace, item.destination);
    if (path.dirname(destination.absolutePath) !== outputDirectory.absolutePath) {
      throw new ApplyPlanError(
        "INVALID_PLAN",
        "Every plan destination must be a direct child of outputDirectory.",
      );
    }
    if (source.relativePath === destination.relativePath) {
      throw new ApplyPlanError(
        "INVALID_PLAN",
        "A plan destination cannot replace its source image.",
      );
    }
    if (itemIds.has(item.id)) {
      throw new ApplyPlanError("INVALID_PLAN", "Plan item IDs must be unique.");
    }
    if (destinations.has(destination.relativePath)) {
      throw new ApplyPlanError("INVALID_PLAN", "Plan destinations must be unique.");
    }
    if (sources.has(source.relativePath)) {
      throw new ApplyPlanError("INVALID_PLAN", "Plan source paths must be unique.");
    }
    itemIds.add(item.id);
    destinations.add(destination.relativePath);
    sources.add(source.relativePath);
  }
  return outputDirectory;
}

async function createDedicatedOutputDirectory(
  workspace: AuthorizedWorkspace,
  outputDirectory: { absolutePath: string; relativePath: string },
) {
  const parent = path.dirname(outputDirectory.absolutePath);
  await assertNoSymlinkComponents(workspace.path, parent);
  const resolvedParent = await realpath(parent).catch(() => {
    throw new ApplyPlanError(
      "PATH_ESCAPE",
      "The output directory parent does not exist or cannot be validated.",
    );
  });
  if (!isWithin(workspace.path, resolvedParent)) {
    throw new ApplyPlanError(
      "PATH_ESCAPE",
      "The output directory parent resolves outside the authorized root.",
    );
  }
  try {
    await lstat(outputDirectory.absolutePath);
    throw new ApplyPlanError(
      "DESTINATION_EXISTS",
      "The dedicated output directory already exists and will not be reused.",
    );
  } catch (error) {
    if (error instanceof ApplyPlanError) throw error;
    if (nodeErrorCode(error) !== "ENOENT") {
      throw new ApplyPlanError(
        "WRITE_FAILED",
        "The output directory could not be validated safely.",
      );
    }
  }
  try {
    await mkdir(outputDirectory.absolutePath, { mode: 0o700 });
  } catch (error) {
    if (nodeErrorCode(error) === "EEXIST") {
      throw new ApplyPlanError(
        "DESTINATION_EXISTS",
        "The dedicated output directory was created concurrently.",
      );
    }
    throw new ApplyPlanError(
      "WRITE_FAILED",
      "The dedicated output directory could not be created.",
    );
  }
  const resolvedOutput = await realpath(outputDirectory.absolutePath).catch(() => null);
  if (!resolvedOutput || !isWithin(workspace.path, resolvedOutput)) {
    throw new ApplyPlanError(
      "PATH_ESCAPE",
      "The created output directory could not be contained safely.",
    );
  }
}

function itemFailure(item: OptimizationPlanItem, error: unknown): ApplyPlanItemResult {
  const common = {
    id: item.id,
    source: {
      identifier: item.source.identifier,
      expectedSha256: item.source.sha256,
    },
    destination: item.destination,
  };
  if (error instanceof OptimizeImageError) {
    return {
      ...common,
      status: error.code === "CANCELLED" ? "cancelled" : "failed",
      optimization: null,
      error: { code: error.code, message: error.message },
    };
  }
  if (error instanceof WorkspaceAuditError) {
    return {
      ...common,
      status: error.code === "CANCELLED" ? "cancelled" : "failed",
      optimization: null,
      error: { code: error.code, message: error.message },
    };
  }
  return {
    ...common,
    status: "failed",
    optimization: null,
    error: {
      code: "INTERNAL_ERROR",
      message: "The plan item could not be optimized safely.",
    },
  };
}

function cancelledItem(item: OptimizationPlanItem): ApplyPlanItemResult {
  return {
    id: item.id,
    source: {
      identifier: item.source.identifier,
      expectedSha256: item.source.sha256,
    },
    destination: item.destination,
    status: "cancelled",
    optimization: null,
    error: { code: "CANCELLED", message: "The request was cancelled." },
  };
}

async function applyItems(
  items: readonly OptimizationPlanItem[],
  configuration: {
    addressPolicy: AddressPolicy;
    approvedRoots: readonly string[];
    clientRoots: readonly string[];
    rootId: string;
    signal?: AbortSignal;
  },
) {
  const results = new Array<ApplyPlanItemResult>(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item === undefined) return;
      if (configuration.signal?.aborted) {
        results[index] = cancelledItem(item);
        continue;
      }
      try {
        const optimization = await optimizeImage(
          {
            source: { type: "workspace", path: item.source.identifier },
            rootId: configuration.rootId,
            destination: item.destination,
            format: item.format,
            mode: "target",
            targetBytes: item.targetBytes,
            smartFit: item.smartFit,
          },
          {
            addressPolicy: configuration.addressPolicy,
            approvedRoots: configuration.approvedRoots,
            clientRoots: configuration.clientRoots,
            expectedSourceSha256: item.source.sha256,
            ...(configuration.signal ? { signal: configuration.signal } : {}),
          },
        );
        results[index] = {
          id: item.id,
          source: {
            identifier: item.source.identifier,
            expectedSha256: item.source.sha256,
          },
          destination: item.destination,
          status: "succeeded",
          optimization,
          error: null,
        };
      } catch (error) {
        results[index] = itemFailure(item, error);
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(APPLY_CONCURRENCY, items.length) }, () => worker()),
  );
  return results;
}

export async function applyImageOptimizationPlan(
  input: ApplyOptimizationPlanInput,
  configuration: {
    addressPolicy: AddressPolicy;
    approvedRoots: readonly string[];
    clientRoots: readonly string[];
    signal?: AbortSignal;
  },
): Promise<ApplyOptimizationPlanOutput> {
  if (configuration.signal?.aborted) {
    throw new WorkspaceAuditError("CANCELLED", "The request was cancelled.");
  }
  const workspace = await resolveAuthorizedWorkspace(
    configuration.approvedRoots,
    configuration.clientRoots,
    input.plan.rootId,
  );
  const outputDirectory = validatePlan(input, workspace);
  await createDedicatedOutputDirectory(workspace, outputDirectory);
  const results = await applyItems(input.plan.items, {
    addressPolicy: configuration.addressPolicy,
    approvedRoots: configuration.approvedRoots,
    clientRoots: configuration.clientRoots,
    rootId: workspace.rootId,
    ...(configuration.signal ? { signal: configuration.signal } : {}),
  });
  const succeeded = results.filter((result) => result.status === "succeeded");
  const failed = results.filter((result) => result.status === "failed");
  const cancelled = results.filter((result) => result.status === "cancelled");
  const originalBytes = succeeded.reduce(
    (sum, result) => sum + result.optimization.original.bytes,
    0,
  );
  const optimizedBytes = succeeded.reduce(
    (sum, result) => sum + result.optimization.optimized.bytes,
    0,
  );
  const manifestPath = `${outputDirectory.relativePath}/${MANIFEST_NAME}`;
  const warnings: ApplyOptimizationPlanOutput["warnings"] = [];
  if (failed.length > 0) {
    warnings.push({
      code: "ITEM_FAILURES",
      message: "One or more plan items failed independently.",
    });
  }
  if (cancelled.length > 0) {
    warnings.push({
      code: "BATCH_CANCELLED",
      message: "Cancellation stopped one or more plan items from being committed.",
    });
  }
  const output = applyOptimizationPlanOutputSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    planId: input.plan.planId,
    rootId: workspace.rootId,
    outputDirectory: outputDirectory.relativePath,
    summary: {
      requested: input.plan.items.length,
      succeeded: succeeded.length,
      failed: failed.length,
      cancelled: cancelled.length,
      originalBytes,
      optimizedBytes,
      savedBytes: Math.max(0, originalBytes - optimizedBytes),
    },
    results,
    manifestPath,
    limits: { concurrency: APPLY_CONCURRENCY, maxItems: MAX_PLAN_ITEMS },
    warnings,
  });
  await commitExclusive(
    path.join(outputDirectory.absolutePath, MANIFEST_NAME),
    Buffer.from(`${JSON.stringify(output, null, 2)}\n`, "utf8"),
    undefined,
  );
  return output;
}
