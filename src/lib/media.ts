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
  brand: {
    logo: {
      kind: "image",
      src: "/icons/brand-avatar.png",
      width: 96,
      height: 96,
      alt: "CompressByURL",
    },
    mascot: {
      kind: "image",
      src: "/media/image-asset%20(9).webp",
      width: 1400,
      height: 1400,
      alt: "CompressByURL mascot",
    },
  },
  hero: {
    compressionFlow: {
      kind: "image",
      src: "/media/compression-flow.png",
      width: 1254,
      height: 1254,
      alt: "Three image tiles becoming one smaller image tile",
    },
    optimizer: {
      kind: "image",
      src: "/media/image%20(2).webp",
      width: 1200,
      height: 800,
      alt: "Large image files becoming smaller optimized website images",
    },
    webGallery: {
      kind: "image",
      src: "/media/image%20(1).webp",
      width: 1200,
      height: 675,
      alt: "Image gallery moving through a fast web workflow",
    },
  },
  features: {
    batch: {
      kind: "image",
      src: "/media/image-asset%20(19).webp",
      width: 1400,
      height: 1050,
      alt: "Mascot carrying a batch of image files",
    },
    compression: {
      kind: "image",
      src: "/media/image-asset%20(12).webp",
      width: 1400,
      height: 1400,
      alt: "Mascot compressing an image to a smaller size",
    },
    delivery: {
      kind: "image",
      src: "/media/image-asset%20(13).webp",
      width: 1400,
      height: 1400,
      alt: "Mascot flying at super speed delivering an optimized image",
    },
    website: {
      kind: "image",
      src: "/media/image-asset%20(2).webp",
      width: 1400,
      height: 1050,
      alt: "Mascot inspecting and extracting images from a website URL",
    },
  },
  footer: {
    workflow: {
      kind: "image",
      src: "/media/image-asset%20(1).webp",
      width: 1400,
      height: 467,
      alt: "Mascot guiding images through a fast browser workflow",
    },
  },
} as const satisfies Record<string, Record<string, MediaAsset>>;
