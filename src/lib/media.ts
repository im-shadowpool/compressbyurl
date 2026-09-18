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
      src: "/media/hero/shiz%20(5).webp",
      width: 1200,
      height: 900,
      alt: "CompressByURL",
    },
    mascot: {
      kind: "image",
      src: "/media/hero/shiz%20(12).webp",
      width: 1200,
      height: 1200,
      alt: "CompressByURL mascot",
    },
  },
  hero: {
    compressionFlow: {
      kind: "image",
      src: "/media/hero/compression-flow.png",
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
      src: "/media/hero/shiz%20(7).webp",
      width: 1200,
      height: 1200,
      alt: "Mascot carrying a batch of image files",
    },
    compression: {
      kind: "image",
      src: "/media/hero/shiz%20(10).webp",
      width: 1200,
      height: 1200,
      alt: "Mascot compressing an image to a smaller size",
    },
    delivery: {
      kind: "image",
      src: "/media/hero/shiz%20(11).webp",
      width: 1200,
      height: 1200,
      alt: "Mascot quickly delivering an optimized image",
    },
    website: {
      kind: "image",
      src: "/media/hero/shiz%20(9).webp",
      width: 1200,
      height: 1200,
      alt: "Mascot reviewing an image discovered on a website",
    },
  },
  footer: {
    workflow: {
      kind: "image",
      src: "/media/hero/shiz%20(2).webp",
      width: 1200,
      height: 400,
      alt: "Mascot guiding images through an optimization workflow",
    },
  },
} as const satisfies Record<string, Record<string, MediaAsset>>;
