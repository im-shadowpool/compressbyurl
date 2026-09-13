export interface ImageMediaAsset {
  kind: "image";
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface VideoMediaAsset {
  kind: "video";
  src: string;
  poster: ImageMediaAsset;
  width: number;
  height: number;
  alt: string;
}

export type MediaAsset = ImageMediaAsset | VideoMediaAsset;

export const media = {
  hero: {
    compressionFlow: {
      kind: "image",
      src: "/media/hero/compression-flow.png",
      width: 1254,
      height: 1254,
      alt: "Three image tiles becoming one smaller image tile",
    },
  },
} as const satisfies Record<string, Record<string, MediaAsset>>;
