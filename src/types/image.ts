export const STATIC_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type StaticImageMimeType = (typeof STATIC_IMAGE_MIME_TYPES)[number];
export type StaticImageFormat = "jpeg" | "png" | "webp" | "avif";

export interface ImageDimensions {
  width: number;
  height: number;
}

export const STATIC_IMAGE_MIME_BY_FORMAT = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
} as const satisfies Record<StaticImageFormat, StaticImageMimeType>;
