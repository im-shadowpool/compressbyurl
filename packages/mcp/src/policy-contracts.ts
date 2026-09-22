import * as z from "zod/v4";

import { SCHEMA_VERSION } from "./constants.js";
import { auditWorkspaceImagesOutputSchema } from "./workspace-contracts.js";

const MAX_POLICY_RULES = 100;

export const imageBudgetSchema = z
  .object({
    maxBytes: z
      .number()
      .int()
      .min(1)
      .max(25 * 1024 * 1024)
      .optional(),
    maxWidth: z.number().int().min(1).max(100_000).optional(),
    maxHeight: z.number().int().min(1).max(100_000).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.maxBytes !== undefined ||
      value.maxWidth !== undefined ||
      value.maxHeight !== undefined,
    "At least one byte or dimension budget is required.",
  );

const policyPatternSchema = z
  .string()
  .min(1)
  .max(256)
  .refine((value) => {
    if (
      value.startsWith("/") ||
      value.startsWith("\\") ||
      value.includes("\\") ||
      value.includes("\0") ||
      /[\[\]{}]/.test(value)
    ) {
      return false;
    }
    const segments = value.split("/");
    return segments.every(
      (segment) =>
        segment.length > 0 &&
        segment !== "." &&
        segment !== ".." &&
        (!segment.includes("**") || segment === "**"),
    );
  }, "Use a relative POSIX glob with *, ?, and whole-segment ** only.");

export const imageBudgetPolicySchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    budgets: imageBudgetSchema,
    rules: z
      .array(
        z
          .object({
            pattern: policyPatternSchema,
            budgets: imageBudgetSchema,
          })
          .strict(),
      )
      .max(MAX_POLICY_RULES)
      .default([]),
  })
  .strict();

export const budgetFindingSchema = z
  .object({
    relativePath: z.string().min(1),
    imageId: z.string().min(1),
    code: z.enum(["MAX_BYTES", "MAX_WIDTH", "MAX_HEIGHT"]),
    actual: z.number().int().positive(),
    limit: z.number().int().positive(),
    ruleIndex: z.number().int().min(0).nullable(),
  })
  .strict();

export const policyCheckOutputSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    status: z.enum(["pass", "budget-failure"]),
    policy: z
      .object({
        schemaVersion: z.literal(SCHEMA_VERSION),
        ruleCount: z.number().int().min(0).max(MAX_POLICY_RULES),
      })
      .strict(),
    summary: z
      .object({
        filesChecked: z.number().int().nonnegative(),
        violationCount: z.number().int().nonnegative(),
      })
      .strict(),
    findings: z.array(budgetFindingSchema).max(3_000),
    audit: auditWorkspaceImagesOutputSchema,
  })
  .strict();

export type ImageBudget = z.infer<typeof imageBudgetSchema>;
export type ImageBudgetPolicy = z.infer<typeof imageBudgetPolicySchema>;
export type BudgetFinding = z.infer<typeof budgetFindingSchema>;
export type PolicyCheckOutput = z.infer<typeof policyCheckOutputSchema>;
