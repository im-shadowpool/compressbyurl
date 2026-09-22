import { imageCandidateSourceSchema } from "@compressbyurl/url-audit-core/schemas";
import * as z from "zod/v4";

import { SCHEMA_VERSION, SUPPORTED_FORMATS } from "./constants.js";
import { warningSchema } from "./contracts.js";

export const auditWebpageImagesInputSchema = z
  .object({
    url: z
      .url()
      .max(4096)
      .refine((value) => {
        const url = new URL(value);
        return (
          ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
        );
      }, "Use an HTTP or HTTPS URL without embedded credentials."),
    maxImages: z.number().int().min(1).max(80).default(20),
  })
  .strict();

export const webpageIssueCodeSchema = z.enum([
  "MISSING_DIMENSIONS",
  "LARGE_DIMENSIONS",
  "HEAVY_FILE",
  "MODERN_FORMAT_OPPORTUNITY",
  "OVERSIZED_FOR_LAYOUT",
  "ALREADY_LEAN",
]);

export const webpageRecommendationSchema = z
  .object({
    action: z.enum(["keep", "compress", "convert", "resize-and-convert"]),
    reasonCodes: z.array(webpageIssueCodeSchema),
    proposedFormat: z.enum(SUPPORTED_FORMATS),
    targetBytes: z.number().int().positive(),
  })
  .strict();

export const webpageImageSchema = z
  .object({
    id: z.string().min(1),
    requestedUrl: z.url(),
    finalUrl: z.url().nullable(),
    sources: z.array(imageCandidateSourceSchema).min(1),
    alt: z.union([z.string().describe("The source alt text when present."), z.null()]),
    declaredWidth: z.number().int().positive().nullable(),
    declaredHeight: z.number().int().positive().nullable(),
    bytes: z.number().int().nonnegative().nullable(),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
    contentType: z
      .enum(["image/jpeg", "image/png", "image/webp", "image/avif"])
      .nullable(),
    format: z.enum(SUPPORTED_FORMATS).nullable(),
    status: z.enum(["measured", "unavailable"]),
    issues: z.array(webpageIssueCodeSchema),
    recommendation: webpageRecommendationSchema.nullable(),
    error: z
      .object({
        code: z.string().min(1),
        message: z.string().min(1),
      })
      .strict()
      .nullable(),
  })
  .strict();

export const auditWebpageImagesOutputSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    page: z
      .object({
        requestedUrl: z.url(),
        finalUrl: z.url(),
        title: z.union([
          z.string().describe("The inert HTML document title when present."),
          z.null(),
        ]),
      })
      .strict(),
    summary: z
      .object({
        totalFound: z.number().int().nonnegative(),
        reportedCount: z.number().int().nonnegative(),
        measuredCount: z.number().int().nonnegative(),
        failedCount: z.number().int().nonnegative(),
        knownBytes: z.number().int().nonnegative(),
        potentialSavingsBytes: z.number().int().nonnegative().nullable(),
      })
      .strict(),
    images: z.array(webpageImageSchema).max(80),
    limits: z
      .object({
        maxImages: z.number().int().min(1).max(80),
        truncated: z.boolean(),
        concurrency: z.number().int().positive(),
        pageMaxBytes: z.number().int().positive(),
        imageMaxBytes: z.number().int().positive(),
        totalImageMaxBytes: z.number().int().positive(),
        decodedPixelLimit: z.number().int().positive(),
        operationTimeoutMs: z.number().int().positive(),
      })
      .strict(),
    warnings: z.array(warningSchema),
  })
  .strict();

export type AuditWebpageImagesInput = z.infer<typeof auditWebpageImagesInputSchema>;
export type AuditWebpageImagesOutput = z.infer<typeof auditWebpageImagesOutputSchema>;
export type WebpageImage = z.infer<typeof webpageImageSchema>;
export type WebpageIssueCode = z.infer<typeof webpageIssueCodeSchema>;
