import * as z from "zod/v4";

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
    url: z.url(),
    source: imageCandidateSourceSchema,
    sources: z.array(imageCandidateSourceSchema).min(1),
    alt: z.string().nullable(),
    declaredWidth: z.number().int().positive().nullable(),
    declaredHeight: z.number().int().positive().nullable(),
  })
  .strict();

export const websiteScanManifestSchema = z
  .object({
    page: z
      .object({
        url: z.url(),
        title: z.string().nullable(),
      })
      .strict(),
    candidates: z.array(websiteImageCandidateSchema).max(80),
    totalFound: z.number().int().nonnegative(),
    limits: z
      .object({
        maxCandidates: z.number().int().positive().max(80),
        truncated: z.boolean(),
      })
      .strict(),
  })
  .strict();

export type ImageCandidateSource = z.infer<typeof imageCandidateSourceSchema>;
export type WebsiteImageCandidate = z.infer<typeof websiteImageCandidateSchema>;
export type WebsiteScanManifest = z.infer<typeof websiteScanManifestSchema>;
