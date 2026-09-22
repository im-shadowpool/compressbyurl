import * as z from "zod/v4";

import { SCHEMA_VERSION } from "./constants.js";
import { optimizeImageOutputSchema } from "./optimize-image-contracts.js";
import { optimizationPlanSchema } from "./workspace-contracts.js";

export const applyOptimizationPlanInputSchema = z
  .object({
    plan: optimizationPlanSchema,
    outputDirectory: z.string().min(1).max(1024),
  })
  .strict();

const itemErrorSchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
  })
  .strict();

const commonResultShape = {
  id: z.string().min(1),
  source: z
    .object({
      identifier: z.string().min(1),
      expectedSha256: z.string().regex(/^[a-f0-9]{64}$/),
    })
    .strict(),
  destination: z.string().min(1),
};

export const applyPlanItemResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      ...commonResultShape,
      status: z.literal("succeeded"),
      optimization: optimizeImageOutputSchema,
      error: z.null(),
    })
    .strict(),
  z
    .object({
      ...commonResultShape,
      status: z.enum(["failed", "cancelled"]),
      optimization: z.null(),
      error: itemErrorSchema,
    })
    .strict(),
]);

export const applyOptimizationPlanOutputSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    planId: z.string().regex(/^[a-f0-9]{64}$/),
    rootId: z.string().min(8),
    outputDirectory: z.string().min(1),
    summary: z
      .object({
        requested: z.number().int().nonnegative(),
        succeeded: z.number().int().nonnegative(),
        failed: z.number().int().nonnegative(),
        cancelled: z.number().int().nonnegative(),
        originalBytes: z.number().int().nonnegative(),
        optimizedBytes: z.number().int().nonnegative(),
        savedBytes: z.number().int().nonnegative(),
      })
      .strict(),
    results: z.array(applyPlanItemResultSchema).max(1_000),
    manifestPath: z.string().min(1),
    limits: z
      .object({
        concurrency: z.number().int().positive(),
        maxItems: z.number().int().positive(),
      })
      .strict(),
    warnings: z.array(
      z
        .object({
          code: z.string().min(1),
          message: z.string().min(1),
        })
        .strict(),
    ),
  })
  .strict();

export type ApplyOptimizationPlanInput = z.infer<typeof applyOptimizationPlanInputSchema>;
export type ApplyOptimizationPlanOutput = z.infer<
  typeof applyOptimizationPlanOutputSchema
>;
export type ApplyPlanItemResult = z.infer<typeof applyPlanItemResultSchema>;
