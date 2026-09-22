import { constants as fsConstants } from "node:fs";
import { open, realpath, stat } from "node:fs/promises";
import path from "node:path";

import {
  imageBudgetPolicySchema,
  policyCheckOutputSchema,
  type BudgetFinding,
  type ImageBudget,
  type ImageBudgetPolicy,
  type PolicyCheckOutput,
} from "./policy-contracts.js";
import { assertNoSymlinkComponents, OptimizeImageError } from "./optimize-image.js";
import { SCHEMA_VERSION } from "./constants.js";
import {
  assertSafeRelativeInput,
  auditWorkspaceImages,
  isWithin,
} from "./workspace-audit.js";
import type { WorkspaceImage } from "./workspace-contracts.js";

const MAX_POLICY_BYTES = 64 * 1024;

export type PolicyCheckErrorCode =
  "INVALID_ARGUMENT" | "POLICY_NOT_FOUND" | "INVALID_POLICY" | "AUDIT_INCOMPLETE";

export class PolicyCheckError extends Error {
  constructor(
    public readonly code: PolicyCheckErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PolicyCheckError";
  }
}

function nodeErrorCode(error: unknown) {
  return error instanceof Error && "code" in error
    ? String((error as NodeJS.ErrnoException).code)
    : null;
}

function segmentMatches(pattern: string, value: string) {
  let expression = "^";
  for (const character of pattern) {
    if (character === "*") expression += "[^/]*";
    else if (character === "?") expression += "[^/]";
    else expression += character.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`${expression}$`, "u").test(value);
}

export function policyPatternMatches(pattern: string, relativePath: string) {
  const patternSegments = pattern.split("/");
  const pathSegments = relativePath.replaceAll("\\", "/").split("/");
  const cache = new Map<string, boolean>();
  function visit(patternIndex: number, pathIndex: number): boolean {
    const key = `${patternIndex}:${pathIndex}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    let matched: boolean;
    if (patternIndex === patternSegments.length) {
      matched = pathIndex === pathSegments.length;
    } else if (patternSegments[patternIndex] === "**") {
      matched =
        visit(patternIndex + 1, pathIndex) ||
        (pathIndex < pathSegments.length && visit(patternIndex, pathIndex + 1));
    } else {
      const patternSegment = patternSegments[patternIndex];
      const pathSegment = pathSegments[pathIndex];
      matched =
        patternSegment !== undefined &&
        pathSegment !== undefined &&
        segmentMatches(patternSegment, pathSegment) &&
        visit(patternIndex + 1, pathIndex + 1);
    }
    cache.set(key, matched);
    return matched;
  }
  return visit(0, 0);
}

interface EffectiveBudget {
  maxBytes?: { value: number; ruleIndex: number | null };
  maxWidth?: { value: number; ruleIndex: number | null };
  maxHeight?: { value: number; ruleIndex: number | null };
}

function applyBudget(
  effective: EffectiveBudget,
  budget: ImageBudget,
  ruleIndex: number | null,
) {
  if (budget.maxBytes !== undefined) {
    effective.maxBytes = { value: budget.maxBytes, ruleIndex };
  }
  if (budget.maxWidth !== undefined) {
    effective.maxWidth = { value: budget.maxWidth, ruleIndex };
  }
  if (budget.maxHeight !== undefined) {
    effective.maxHeight = { value: budget.maxHeight, ruleIndex };
  }
}

function effectiveBudget(policy: ImageBudgetPolicy, relativePath: string) {
  const effective: EffectiveBudget = {};
  applyBudget(effective, policy.budgets, null);
  policy.rules.forEach((rule, index) => {
    if (policyPatternMatches(rule.pattern, relativePath)) {
      applyBudget(effective, rule.budgets, index);
    }
  });
  return effective;
}

export function evaluateImageBudgetPolicy(
  policy: ImageBudgetPolicy,
  images: readonly WorkspaceImage[],
) {
  const findings: BudgetFinding[] = [];
  for (const image of images) {
    const budget = effectiveBudget(policy, image.relativePath);
    const checks = [
      {
        code: "MAX_BYTES" as const,
        actual: image.bytes,
        budget: budget.maxBytes,
      },
      {
        code: "MAX_WIDTH" as const,
        actual: image.width,
        budget: budget.maxWidth,
      },
      {
        code: "MAX_HEIGHT" as const,
        actual: image.height,
        budget: budget.maxHeight,
      },
    ];
    for (const check of checks) {
      if (check.budget && check.actual > check.budget.value) {
        findings.push({
          relativePath: image.relativePath,
          imageId: image.id,
          code: check.code,
          actual: check.actual,
          limit: check.budget.value,
          ruleIndex: check.budget.ruleIndex,
        });
      }
    }
  }
  return findings;
}

export async function loadImageBudgetPolicy(
  root: string,
  policyPath: string,
): Promise<ImageBudgetPolicy> {
  try {
    assertSafeRelativeInput(policyPath);
  } catch {
    throw new PolicyCheckError(
      "INVALID_ARGUMENT",
      "The policy path must be workspace-relative and contained.",
    );
  }
  const absolutePath = path.resolve(root, policyPath);
  if (!isWithin(root, absolutePath)) {
    throw new PolicyCheckError(
      "INVALID_ARGUMENT",
      "The policy path must stay beneath the workspace root.",
    );
  }
  try {
    await assertNoSymlinkComponents(root, absolutePath);
  } catch (error) {
    if (error instanceof OptimizeImageError && error.code === "FILE_NOT_FOUND") {
      throw new PolicyCheckError("POLICY_NOT_FOUND", "The policy file was not found.");
    }
    throw new PolicyCheckError(
      "INVALID_POLICY",
      "The policy file cannot use symbolic links or junctions.",
    );
  }
  const resolved = await realpath(absolutePath).catch(() => null);
  if (!resolved || !isWithin(root, resolved)) {
    throw new PolicyCheckError("POLICY_NOT_FOUND", "The policy file was not found.");
  }
  const details = await stat(resolved).catch(() => null);
  if (!details?.isFile() || details.size <= 0 || details.size > MAX_POLICY_BYTES) {
    throw new PolicyCheckError(
      "INVALID_POLICY",
      "The policy must be a non-empty JSON file no larger than 64 KiB.",
    );
  }
  const noFollow = "O_NOFOLLOW" in fsConstants ? fsConstants.O_NOFOLLOW : 0;
  let handle;
  try {
    handle = await open(resolved, fsConstants.O_RDONLY | noFollow);
  } catch (error) {
    if (nodeErrorCode(error) === "ENOENT") {
      throw new PolicyCheckError("POLICY_NOT_FOUND", "The policy file was not found.");
    }
    throw new PolicyCheckError("INVALID_POLICY", "The policy file could not be read.");
  }
  let contents: string;
  try {
    const opened = await handle.stat();
    if (!opened.isFile() || opened.size !== details.size) {
      throw new PolicyCheckError(
        "INVALID_POLICY",
        "The policy file changed while it was being read.",
      );
    }
    contents = await handle.readFile("utf8");
  } finally {
    await handle.close();
  }
  let candidate: unknown;
  try {
    candidate = JSON.parse(contents);
  } catch {
    throw new PolicyCheckError("INVALID_POLICY", "The policy is not valid JSON.");
  }
  const parsed = imageBudgetPolicySchema.safeParse(candidate);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const location = issue?.path.length ? issue.path.join(".") : "policy";
    throw new PolicyCheckError(
      "INVALID_POLICY",
      `The policy failed validation at ${location}: ${issue?.message ?? "invalid value"}.`,
    );
  }
  return parsed.data;
}

export async function resolveCheckRoot(root: string) {
  const resolved = await realpath(root).catch(() => null);
  const details = resolved ? await stat(resolved).catch(() => null) : null;
  if (!resolved || !details?.isDirectory()) {
    throw new PolicyCheckError(
      "INVALID_ARGUMENT",
      "The check root must be an existing directory.",
    );
  }
  return resolved;
}

export async function checkWorkspaceImagePolicy(configuration: {
  root: string;
  directory: string;
  maxFiles: number;
  policy: ImageBudgetPolicy;
  signal?: AbortSignal;
}): Promise<PolicyCheckOutput> {
  const audit = await auditWorkspaceImages(
    { directory: configuration.directory, maxFiles: configuration.maxFiles },
    {
      approvedRoots: [configuration.root],
      clientRoots: [configuration.root],
      ...(configuration.signal ? { signal: configuration.signal } : {}),
    },
  );
  const unsafeSkipped = audit.skipped.filter(
    (skipped) => skipped.code !== "UNSUPPORTED_FORMAT",
  );
  if (audit.limits.truncated || unsafeSkipped.length > 0) {
    throw new PolicyCheckError(
      "AUDIT_INCOMPLETE",
      "The workspace audit was incomplete; fix skipped files or raise the file limit.",
    );
  }
  const findings = evaluateImageBudgetPolicy(configuration.policy, audit.images);
  return policyCheckOutputSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    status: findings.length === 0 ? "pass" : "budget-failure",
    policy: {
      schemaVersion: configuration.policy.schemaVersion,
      ruleCount: configuration.policy.rules.length,
    },
    summary: {
      filesChecked: audit.images.length,
      violationCount: findings.length,
    },
    findings,
    audit,
  });
}
