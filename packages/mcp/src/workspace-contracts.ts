import * as z from "zod/v4";

import { SCHEMA_VERSION, SUPPORTED_FORMATS } from "./constants.js";
import { warningSchema } from "./contracts.js";

export const workspaceIssueCodeSchema = z.enum([
  "LARGE_FILE",
  "LARGE_DIMENSIONS",
  "MODERN_FORMAT_OPPORTUNITY",
  "DUPLICATE",
  "ALREADY_LEAN",
]);

export const auditWorkspaceImagesInputSchema = z
  .object({
    rootId: z.string().min(8).max(64).optional(),
    directory: z.string().min(1).max(1024).default("."),
    maxFiles: z.number().int().min(1).max(1_000).default(200),
  })
  .strict();

const nullableIdentifierSchema = z.union([
  z.string().min(1).describe("An opaque related item identifier."),
  z.null(),
]);

export const workspaceProposalSchema = z
  .object({
    destination: z.string().min(1),
    format: z.enum(SUPPORTED_FORMATS),
    mode: z.literal("target"),
    targetBytes: z
      .number()
      .int()
      .min(1)
      .max(25 * 1024 * 1024),
    smartFit: z.boolean(),
    reasonCodes: z.array(workspaceIssueCodeSchema).min(1),
  })
  .strict();

export const workspaceImageSchema = z
  .object({
    id: z.string().min(1),
    relativePath: z.string().min(1),
    bytes: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    format: z.enum(SUPPORTED_FORMATS),
    contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    duplicateOf: nullableIdentifierSchema,
    issues: z.array(workspaceIssueCodeSchema),
    proposal: workspaceProposalSchema.nullable(),
  })
  .strict();

export const optimizationPlanItemSchema = z
  .object({
    id: z.string().min(1),
    source: z
      .object({
        type: z.literal("workspace"),
        identifier: z.string().min(1),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict(),
    destination: z.string().min(1),
    format: z.enum(SUPPORTED_FORMATS),
    mode: z.literal("target"),
    targetBytes: z
      .number()
      .int()
      .min(1)
      .max(25 * 1024 * 1024),
    smartFit: z.boolean(),
    reasonCodes: z.array(workspaceIssueCodeSchema).min(1),
  })
  .strict();

export const optimizationPlanSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    planId: z.string().regex(/^[a-f0-9]{64}$/),
    rootId: z.string().min(8),
    createdFrom: z.literal("workspace"),
    items: z.array(optimizationPlanItemSchema).max(1_000),
  })
  .strict();

export const auditWorkspaceImagesOutputSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    rootId: z.string().min(8),
    directory: z.string().min(1),
    summary: z
      .object({
        filesFound: z.number().int().nonnegative(),
        filesReported: z.number().int().nonnegative(),
        supportedBytes: z.number().int().nonnegative(),
        duplicateBytes: z.number().int().nonnegative(),
        skippedCount: z.number().int().nonnegative(),
      })
      .strict(),
    images: z.array(workspaceImageSchema).max(1_000),
    plan: optimizationPlanSchema,
    skipped: z
      .array(
        z
          .object({
            relativePath: z.string().min(1),
            code: z.string().min(1),
            message: z.string().min(1),
          })
          .strict(),
      )
      .max(1_000),
    limits: z
      .object({
        maxFiles: z.number().int().min(1).max(1_000),
        truncated: z.boolean(),
        maxDepth: z.number().int().positive(),
        maxFileBytes: z.number().int().positive(),
        totalSourceMaxBytes: z.number().int().positive(),
        decodedPixelLimit: z.number().int().positive(),
        concurrency: z.number().int().positive(),
        maxSkippedReported: z.number().int().positive(),
      })
      .strict(),
    warnings: z.array(warningSchema),
  })
  .strict();

export type AuditWorkspaceImagesInput = z.infer<typeof auditWorkspaceImagesInputSchema>;
export type AuditWorkspaceImagesOutput = z.infer<typeof auditWorkspaceImagesOutputSchema>;
export type WorkspaceImage = z.infer<typeof workspaceImageSchema>;
export type WorkspaceIssueCode = z.infer<typeof workspaceIssueCodeSchema>;
export type OptimizationPlan = z.infer<typeof optimizationPlanSchema>;
export type OptimizationPlanItem = z.infer<typeof optimizationPlanItemSchema>;
