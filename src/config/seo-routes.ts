import type { Metadata } from "next";

import type { CompressionPresetId, OutputFormat } from "@/features/compression";
import type { AcceptedImageFormat } from "@/features/file-intake";

export type SeoRoutePath =
  | "/"
  | "/compress-image"
  | "/compress-jpg"
  | "/compress-png"
  | "/compress-webp"
  | "/image-converter"
  | "/jpg-to-webp"
  | "/png-to-webp"
  | "/webp-to-jpg"
  | "/png-to-jpg"
  | "/jpg-to-png"
  | "/jpg-to-avif"
  | "/png-to-avif"
  | "/resize-image"
  | "/compress-image-to-100kb"
  | "/compress-image-to-200kb"
  | "/compress-image-to-500kb"
  | "/compress-image-to-1mb"
  | "/compress-image-from-url"
  | "/website-image-optimizer"
  | "/website-image-scanner"
  | "/download-images-from-url"
  | "/tinypng-alternative"
  | "/squoosh-alternative"
  | "/compressimage-alternative"
  | "/iloveimg-alternative";

type UploadPreset = {
  acceptedFormats: readonly AcceptedImageFormat[];
  compressionPreset: CompressionPresetId;
  outputFormat: OutputFormat;
  settingsPanel: "default" | "format" | "resize" | "target-size";
  sourceMode: "upload";
};

type ImageUrlPreset = {
  compressionPreset: CompressionPresetId;
  outputFormat: OutputFormat;
  sourceMode: "image-url";
};

type WebsiteUrlPreset = {
  purpose: "download" | "optimizer" | "scanner";
  sourceMode: "website-url";
};

export type SeoToolPreset = UploadPreset | ImageUrlPreset | WebsiteUrlPreset;

export interface SeoRouteDefinition {
  canonical: SeoRoutePath;
  description: string;
  h1: string;
  path: SeoRoutePath;
  preset: SeoToolPreset;
  published: boolean;
  relatedTools: readonly SeoRoutePath[];
  title: string;
}

const ALL_FORMATS = ["jpeg", "png", "webp", "avif"] as const;
const JPEG_ONLY = ["jpeg"] as const;
const PNG_ONLY = ["png"] as const;
const WEBP_ONLY = ["webp"] as const;

export const SEO_ROUTE_REGISTRY = [
  {
    canonical: "/",
    description:
      "Compress JPG, PNG, WebP and AVIF in your browser, or paste a URL to optimize remote images and webpage assets.",
    h1: "Compress images from files or URLs.",
    path: "/",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image",
      "/compress-image-from-url",
      "/website-image-optimizer",
    ],
    title: "Free Image Compressor & URL Image Optimizer | CompressByURL",
  },
  {
    canonical: "/compress-image",
    description:
      "Compress JPEG, PNG, WebP and static AVIF images locally in your browser with Smart, quality or target-size controls.",
    h1: "Compress Images Online",
    path: "/compress-image",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-jpg",
      "/resize-image",
      "/compress-image-to-100kb",
      "/tinypng-alternative",
      "/squoosh-alternative",
    ],
    title: "Compress Images Online for Free | CompressByURL",
  },
  {
    canonical: "/compress-jpg",
    description:
      "Reduce JPEG and JPG file size locally with adjustable quality, resizing and metadata removal.",
    h1: "Compress JPG Images Online",
    path: "/compress-jpg",
    preset: {
      acceptedFormats: JPEG_ONLY,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/image-converter", "/jpg-to-webp", "/compress-image-to-200kb"],
    title: "Compress JPG Images Online | CompressByURL",
  },
  {
    canonical: "/compress-png",
    description:
      "Optimize PNG images locally with lossless compression while preserving dimensions and transparency.",
    h1: "Compress PNG Images Online",
    path: "/compress-png",
    preset: {
      acceptedFormats: PNG_ONLY,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/compress-image", "/png-to-webp", "/compress-image-to-100kb"],
    title: "Compress PNG Images Online | CompressByURL",
  },
  {
    canonical: "/compress-webp",
    description:
      "Compress static WebP images locally with Smart or manual quality controls and optional resizing.",
    h1: "Compress WebP Images Online",
    path: "/compress-webp",
    preset: {
      acceptedFormats: WEBP_ONLY,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image",
      "/image-converter",
      "/compress-image-to-500kb",
      "/iloveimg-alternative",
    ],
    title: "Compress WebP Images Online | CompressByURL",
  },
  {
    canonical: "/image-converter",
    description:
      "Convert JPEG, PNG, WebP and static AVIF images locally with format-correct downloads and transparency handling.",
    h1: "Convert Images Online",
    path: "/image-converter",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "webp",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/jpg-to-webp", "/png-to-webp", "/compress-webp"],
    title: "Image Converter — JPEG, PNG, WebP & AVIF | CompressByURL",
  },
  {
    canonical: "/jpg-to-webp",
    description:
      "Convert JPEG and JPG images to WebP locally for smaller web-ready files with adjustable quality and dimensions.",
    h1: "Convert JPG to WebP",
    path: "/jpg-to-webp",
    preset: {
      acceptedFormats: JPEG_ONLY,
      compressionPreset: "custom",
      outputFormat: "webp",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/compress-jpg", "/png-to-webp", "/compress-image-to-200kb"],
    title: "Convert JPG to WebP Online | CompressByURL",
  },
  {
    canonical: "/png-to-webp",
    description:
      "Convert PNG images to WebP locally while retaining transparency and controlling output quality and dimensions.",
    h1: "Convert PNG to WebP",
    path: "/png-to-webp",
    preset: {
      acceptedFormats: PNG_ONLY,
      compressionPreset: "custom",
      outputFormat: "webp",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/compress-png", "/jpg-to-webp", "/compress-image-to-100kb"],
    title: "Convert PNG to WebP Online | CompressByURL",
  },
  {
    canonical: "/webp-to-jpg",
    description:
      "Convert static WebP images to compatible JPEG files locally with an explicit background for transparent pixels.",
    h1: "Convert WebP to JPG",
    path: "/webp-to-jpg",
    preset: {
      acceptedFormats: WEBP_ONLY,
      compressionPreset: "custom",
      outputFormat: "jpeg",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: false,
    relatedTools: ["/compress-webp", "/image-converter", "/jpg-to-webp"],
    title: "Convert WebP to JPG Online | CompressByURL",
  },
  {
    canonical: "/png-to-jpg",
    description:
      "Convert PNG images to JPEG locally with adjustable quality and a chosen background for transparent areas.",
    h1: "Convert PNG to JPG",
    path: "/png-to-jpg",
    preset: {
      acceptedFormats: PNG_ONLY,
      compressionPreset: "custom",
      outputFormat: "jpeg",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: false,
    relatedTools: ["/compress-png", "/png-to-webp", "/image-converter"],
    title: "Convert PNG to JPG Online | CompressByURL",
  },
  {
    canonical: "/jpg-to-png",
    description:
      "Convert JPEG and JPG images to PNG locally with format-correct output and optional resizing.",
    h1: "Convert JPG to PNG",
    path: "/jpg-to-png",
    preset: {
      acceptedFormats: JPEG_ONLY,
      compressionPreset: "custom",
      outputFormat: "png",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: false,
    relatedTools: ["/compress-jpg", "/jpg-to-webp", "/image-converter"],
    title: "Convert JPG to PNG Online | CompressByURL",
  },
  {
    canonical: "/jpg-to-avif",
    description:
      "Convert JPEG and JPG images to static AVIF locally with adjustable quality and optional resizing.",
    h1: "Convert JPG to AVIF",
    path: "/jpg-to-avif",
    preset: {
      acceptedFormats: JPEG_ONLY,
      compressionPreset: "custom",
      outputFormat: "avif",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: false,
    relatedTools: ["/compress-jpg", "/jpg-to-webp", "/png-to-avif"],
    title: "Convert JPG to AVIF Online | CompressByURL",
  },
  {
    canonical: "/png-to-avif",
    description:
      "Convert PNG images to static AVIF locally while retaining transparency and controlling output quality.",
    h1: "Convert PNG to AVIF",
    path: "/png-to-avif",
    preset: {
      acceptedFormats: PNG_ONLY,
      compressionPreset: "custom",
      outputFormat: "avif",
      settingsPanel: "format",
      sourceMode: "upload",
    },
    published: false,
    relatedTools: ["/compress-png", "/png-to-webp", "/jpg-to-avif"],
    title: "Convert PNG to AVIF Online | CompressByURL",
  },
  {
    canonical: "/resize-image",
    description:
      "Resize JPEG, PNG, WebP and static AVIF images locally by maximum or exact dimensions without unintended upscaling.",
    h1: "Resize Images Online",
    path: "/resize-image",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "resize",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/compress-image", "/image-converter", "/compress-image-to-500kb"],
    title: "Resize Images Online | CompressByURL",
  },
  {
    canonical: "/compress-image-to-100kb",
    description:
      "Compress an image to 100 KB or less locally with bounded quality search and optional Smart Fit dimension reduction.",
    h1: "Compress an Image to 100KB",
    path: "/compress-image-to-100kb",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "target-100",
      outputFormat: "webp",
      settingsPanel: "target-size",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image-to-200kb",
      "/compress-image",
      "/compress-image-from-url",
    ],
    title: "Compress Image to 100KB Online | CompressByURL",
  },
  {
    canonical: "/compress-image-to-200kb",
    description:
      "Compress an image to 200 KB or less locally while keeping the highest tested quality that meets the limit.",
    h1: "Compress an Image to 200KB",
    path: "/compress-image-to-200kb",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "target-200",
      outputFormat: "webp",
      settingsPanel: "target-size",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image-to-100kb",
      "/compress-image-to-500kb",
      "/compress-image",
    ],
    title: "Compress Image to 200KB Online | CompressByURL",
  },
  {
    canonical: "/compress-image-to-500kb",
    description:
      "Compress an image to 500 KB or less locally with target-size search, resizing controls and downloadable results.",
    h1: "Compress an Image to 500KB",
    path: "/compress-image-to-500kb",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "target-500",
      outputFormat: "webp",
      settingsPanel: "target-size",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/compress-image-to-200kb", "/compress-image-to-1mb", "/resize-image"],
    title: "Compress Image to 500KB Online | CompressByURL",
  },
  {
    canonical: "/compress-image-to-1mb",
    description:
      "Compress an image to 1 MB or less locally with a 1,024 KB target and optional Smart Fit dimension reduction.",
    h1: "Compress an Image to 1MB",
    path: "/compress-image-to-1mb",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "target-1024",
      outputFormat: "webp",
      settingsPanel: "target-size",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image-to-500kb",
      "/compress-image",
      "/website-image-optimizer",
    ],
    title: "Compress Image to 1MB Online | CompressByURL",
  },
  {
    canonical: "/compress-image-from-url",
    description:
      "Fetch one public JPEG, PNG, WebP or static AVIF URL, then compress it locally in your browser.",
    h1: "Compress an Image from a URL",
    path: "/compress-image-from-url",
    preset: {
      compressionPreset: "custom",
      outputFormat: "keep",
      sourceMode: "image-url",
    },
    published: true,
    relatedTools: [
      "/website-image-optimizer",
      "/website-image-scanner",
      "/compress-image",
      "/compressimage-alternative",
    ],
    title: "Compress Image from URL Online | CompressByURL",
  },
  {
    canonical: "/website-image-optimizer",
    description:
      "Scan one public webpage, select heavy image candidates, optimize them locally and download a replacement bundle.",
    h1: "Optimize Images from Any Webpage",
    path: "/website-image-optimizer",
    preset: { purpose: "optimizer", sourceMode: "website-url" },
    published: true,
    relatedTools: [
      "/website-image-scanner",
      "/compress-image-from-url",
      "/download-images-from-url",
    ],
    title: "Website Image Optimizer — Find & Compress Heavy Images | CompressByURL",
  },
  {
    canonical: "/website-image-scanner",
    description:
      "Scan a public webpage for discoverable image candidates, dimensions, formats and optimization opportunities.",
    h1: "Scan a Webpage for Image Problems",
    path: "/website-image-scanner",
    preset: { purpose: "scanner", sourceMode: "website-url" },
    published: true,
    relatedTools: [
      "/website-image-optimizer",
      "/compress-image-from-url",
      "/download-images-from-url",
    ],
    title: "Website Image Scanner — Find Heavy Images | CompressByURL",
  },
  {
    canonical: "/download-images-from-url",
    description:
      "Discover supported images from one public webpage and download selected files without claiming a full-site crawl.",
    h1: "Download Images from a Webpage",
    path: "/download-images-from-url",
    preset: { purpose: "download", sourceMode: "website-url" },
    published: false,
    relatedTools: [
      "/website-image-scanner",
      "/website-image-optimizer",
      "/compress-image-from-url",
    ],
    title: "Download Images from a Webpage URL | CompressByURL",
  },
  {
    canonical: "/tinypng-alternative",
    description:
      "Compare CompressByURL and TinyPNG for local privacy, supported formats, batch limits and URL-based image workflows.",
    h1: "A TinyPNG Alternative for Local and URL Workflows",
    path: "/tinypng-alternative",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image",
      "/compress-image-from-url",
      "/website-image-scanner",
    ],
    title: "TinyPNG Alternative for Files & URLs | CompressByURL",
  },
  {
    canonical: "/squoosh-alternative",
    description:
      "Compare CompressByURL and Squoosh for browser-local compression, batch work, target sizes and URL image optimization.",
    h1: "A Squoosh Alternative for Batches and URLs",
    path: "/squoosh-alternative",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image",
      "/compress-image-to-200kb",
      "/website-image-optimizer",
    ],
    title: "Squoosh Alternative for Batch Image Work | CompressByURL",
  },
  {
    canonical: "/compressimage-alternative",
    description:
      "Compare CompressByURL and CompressImage.io for local compression, batch ZIPs, resize controls and URL workflows.",
    h1: "A CompressImage.io Alternative with URL Tools",
    path: "/compressimage-alternative",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: [
      "/compress-image",
      "/compress-image-from-url",
      "/website-image-optimizer",
    ],
    title: "CompressImage.io Alternative with URL Tools | CompressByURL",
  },
  {
    canonical: "/iloveimg-alternative",
    description:
      "Compare CompressByURL and iLoveIMG for processing privacy, formats, batch limits and URL-based image optimization.",
    h1: "An iLoveIMG Alternative with Local Processing",
    path: "/iloveimg-alternative",
    preset: {
      acceptedFormats: ALL_FORMATS,
      compressionPreset: "custom",
      outputFormat: "keep",
      settingsPanel: "default",
      sourceMode: "upload",
    },
    published: true,
    relatedTools: ["/compress-image", "/resize-image", "/website-image-scanner"],
    title: "iLoveIMG Alternative with Local Compression | CompressByURL",
  },
] as const satisfies readonly SeoRouteDefinition[];

const routeByPath = new Map<SeoRoutePath, SeoRouteDefinition>(
  SEO_ROUTE_REGISTRY.map((route) => [route.path, route]),
);

function assertValidRegistry() {
  const uniqueTitles = new Set<string>();
  const uniqueHeadings = new Set<string>();

  for (const route of SEO_ROUTE_REGISTRY) {
    if (route.canonical !== route.path) {
      throw new Error(`SEO route ${route.path} must be self-canonical.`);
    }
    if (uniqueTitles.has(route.title)) {
      throw new Error(`Duplicate SEO title: ${route.title}`);
    }
    if (uniqueHeadings.has(route.h1)) {
      throw new Error(`Duplicate SEO H1: ${route.h1}`);
    }
    uniqueTitles.add(route.title);
    uniqueHeadings.add(route.h1);

    for (const relatedPath of route.relatedTools) {
      if (relatedPath === route.path) {
        throw new Error(`SEO route ${route.path} cannot link to itself.`);
      }
      if (!SEO_ROUTE_REGISTRY.some((candidate) => candidate.path === relatedPath)) {
        throw new Error(`SEO route ${route.path} links to unknown route ${relatedPath}.`);
      }
    }
  }
}

assertValidRegistry();

export function getSeoRoute(path: SeoRoutePath) {
  const route = routeByPath.get(path);
  if (!route) throw new Error(`Unknown SEO route: ${path}`);
  return route;
}

export function getPublishedSeoRoutes() {
  return SEO_ROUTE_REGISTRY.filter((route) => route.published);
}

export function createSeoMetadata(path: SeoRoutePath): Metadata {
  const route = getSeoRoute(path);
  return {
    alternates: { canonical: route.canonical },
    description: route.description,
    openGraph: {
      description: route.description,
      title: route.title,
      type: "website",
      url: route.canonical,
    },
    title: { absolute: route.title },
    twitter: {
      card: "summary_large_image",
      description: route.description,
      title: route.title,
    },
  };
}
