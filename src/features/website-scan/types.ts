import { z } from "zod";

export const imageCandidateSourceSchema = z.enum([
  "image",
  "lazy-image",
  "srcset",
  "picture",
  "metadata",
  "preload",
]);

export const websiteImageCandidateSchema = z
  .object({
    id: z.string(),
    url: z.string().url(),
    source: imageCandidateSourceSchema,
    alt: z.string().nullable(),
    declaredWidth: z.number().int().positive().nullable(),
    declaredHeight: z.number().int().positive().nullable(),
  })
  .strict();

export const websiteScanManifestSchema = z
  .object({
    page: z
      .object({
        url: z.string().url(),
        title: z.string().nullable(),
      })
      .strict(),
    candidates: z.array(websiteImageCandidateSchema).max(80),
    limits: z
      .object({
        maxCandidates: z.number().int().positive(),
        truncated: z.boolean(),
      })
      .strict(),
  })
  .strict();

export type ImageCandidateSource = z.infer<typeof imageCandidateSourceSchema>;
export type WebsiteImageCandidate = z.infer<typeof websiteImageCandidateSchema>;
export type WebsiteScanManifest = z.infer<typeof websiteScanManifestSchema>;
