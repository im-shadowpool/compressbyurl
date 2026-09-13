import type { Metadata } from "next";

export type EditorialRoutePath =
  | "/learn"
  | "/learn/webp-vs-avif-vs-jpeg"
  | "/learn/how-target-size-compression-works"
  | "/learn/find-large-images-on-a-website";

export interface EditorialRouteDefinition {
  canonical: EditorialRoutePath;
  description: string;
  h1: string;
  path: EditorialRoutePath;
  published: boolean;
  title: string;
}

export const EDITORIAL_ROUTE_REGISTRY = [
  {
    canonical: "/learn",
    description:
      "Practical, evidence-led guides to image formats, target file sizes and finding oversized webpage images.",
    h1: "Practical image optimization guides",
    path: "/learn",
    published: true,
    title: "Image Optimization Guides | CompressByURL",
  },
  {
    canonical: "/learn/webp-vs-avif-vs-jpeg",
    description:
      "Choose between JPEG, WebP and AVIF using compatibility, transparency, encoding time and measured output—not a universal winner.",
    h1: "WebP vs AVIF vs JPEG: choose by the image",
    path: "/learn/webp-vs-avif-vs-jpeg",
    published: true,
    title: "WebP vs AVIF vs JPEG: Practical Format Guide | CompressByURL",
  },
  {
    canonical: "/learn/how-target-size-compression-works",
    description:
      "Learn how an image compressor searches quality and dimensions to meet a target such as 200 KB, including honest failure cases.",
    h1: "How target-size image compression works",
    path: "/learn/how-target-size-compression-works",
    published: true,
    title: "How Target-Size Image Compression Works | CompressByURL",
  },
  {
    canonical: "/learn/find-large-images-on-a-website",
    description:
      "Find likely oversized and heavy webpage images by comparing bytes, intrinsic dimensions, rendered size and HTML hints.",
    h1: "How to find large images on a website",
    path: "/learn/find-large-images-on-a-website",
    published: true,
    title: "How to Find Large Images on a Website | CompressByURL",
  },
] as const satisfies readonly EditorialRouteDefinition[];

const routeByPath = new Map<EditorialRoutePath, EditorialRouteDefinition>(
  EDITORIAL_ROUTE_REGISTRY.map((route) => [route.path, route]),
);

export function getEditorialRoute(path: EditorialRoutePath) {
  const route = routeByPath.get(path);
  if (!route) throw new Error(`Unknown editorial route: ${path}`);
  return route;
}

export function getPublishedEditorialRoutes() {
  return EDITORIAL_ROUTE_REGISTRY.filter((route) => route.published);
}

export function createEditorialMetadata(path: EditorialRoutePath): Metadata {
  const route = getEditorialRoute(path);
  return {
    alternates: { canonical: route.canonical },
    description: route.description,
    openGraph: {
      description: route.description,
      title: route.title,
      type: path === "/learn" ? "website" : "article",
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
