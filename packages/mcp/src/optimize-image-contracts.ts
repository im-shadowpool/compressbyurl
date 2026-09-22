import * as z from "zod/v4";

import { SCHEMA_VERSION, SUPPORTED_FORMATS } from "./constants.js";
import { warningSchema } from "./contracts.js";

const workspaceSourceSchema = z
  .object({
    type: z.literal("workspace"),
    path: z.string().min(1).max(1024),
  })
  .strict();

const urlSourceSchema = z
  .object({
    type: z.literal("url"),
    url: z
      .url()
      .max(4096)
      .refine((value) => {
        const parsed = new URL(value);
        return (
          ["http:", "https:"].includes(parsed.protocol) &&
          !parsed.username &&
          !parsed.password
        );
      }, "Use an HTTP or HTTPS URL without embedded credentials."),
  })
  .strict();

const sourceSchema = z.discriminatedUnion("type", [
  workspaceSourceSchema,
  urlSourceSchema,
]);

const commonInputShape = {
  source: sourceSchema,
  rootId: z.string().min(8).max(64).optional(),
  destination: z.string().min(1).max(1024),
  format: z.enum(SUPPORTED_FORMATS),
  smartFit: z.boolean().default(false),
  maxWidth: z.number().int().min(1).max(100_000).optional(),
  maxHeight: z.number().int().min(1).max(100_000).optional(),
  jpegBackground: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
};

function validateConditionalInput(
  value: {
    format: "jpeg" | "png" | "webp" | "avif";
    smartFit: boolean;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;
    jpegBackground?: string | undefined;
  },
  context: z.RefinementCtx,
) {
  if (
    !value.smartFit &&
    (value.maxWidth !== undefined || value.maxHeight !== undefined)
  ) {
    context.addIssue({
      code: "custom",
      message: "Dimension limits require smartFit: true.",
      path: ["smartFit"],
    });
  }
  if (value.format !== "jpeg" && value.jpegBackground !== undefined) {
    context.addIssue({
      code: "custom",
      message: "jpegBackground is accepted only for JPEG output.",
      path: ["jpegBackground"],
    });
  }
}

const qualityInputSchema = z
  .object({
    ...commonInputShape,
    mode: z.literal("quality"),
    quality: z.number().int().min(1).max(100),
  })
  .strict()
  .superRefine(validateConditionalInput);

const targetInputSchema = z
  .object({
    ...commonInputShape,
    mode: z.literal("target"),
    targetBytes: z
      .number()
      .int()
      .min(1)
      .max(25 * 1024 * 1024),
  })
  .strict()
  .superRefine(validateConditionalInput);

export const optimizeImageInputSchema = z.union([qualityInputSchema, targetInputSchema]);

const imageFactsSchema = z
  .object({
    bytes: z.number().int().positive(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    format: z.enum(SUPPORTED_FORMATS),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const nullableQualitySchema = z.union([
  z.number().int().min(1).max(100).describe("The encoder quality when applicable."),
  z.null(),
]);
const nullableTargetSchema = z.union([
  z.number().int().positive().describe("The requested byte target."),
  z.null(),
]);
const nullableBooleanSchema = z.union([
  z.boolean().describe("Whether the requested target was met."),
  z.null(),
]);

export const optimizeImageOutputSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    source: z
      .object({
        type: z.enum(["workspace", "url"]),
        identifier: z.string().min(1),
      })
      .strict(),
    original: imageFactsSchema,
    optimized: imageFactsSchema.extend({ quality: nullableQualitySchema }).strict(),
    target: z
      .object({
        requestedBytes: nullableTargetSchema,
        met: nullableBooleanSchema,
      })
      .strict(),
    savedBytes: z.number().int().nonnegative(),
    savingsPercent: z.number().min(0).max(100),
    destination: z.string().min(1),
    settings: z
      .object({
        smartFit: z.boolean(),
        maxWidth: z.number().int().positive().nullable(),
        maxHeight: z.number().int().positive().nullable(),
        jpegBackground: z.union([z.string().regex(/^#[0-9a-fA-F]{6}$/), z.null()]),
        metadataStripped: z.literal(true),
        orientationNormalized: z.literal(true),
        attempts: z.number().int().positive(),
        qualityFloor: z.number().int().positive(),
      })
      .strict(),
    encoder: z
      .object({
        name: z.literal("sharp"),
        version: z.string().min(1),
      })
      .strict(),
    warnings: z.array(warningSchema),
  })
  .strict();

export type OptimizeImageInput = z.infer<typeof optimizeImageInputSchema>;
export type OptimizeImageOutput = z.infer<typeof optimizeImageOutputSchema>;
