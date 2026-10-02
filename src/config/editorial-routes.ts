import type { Metadata } from "next";
import {
  articleImage,
  BLOG_AUTHOR,
  getBlogArticle,
  getBlogArticles,
  type BlogSlug,
} from "@/content/blog";

export type EditorialRoutePath = "/learn" | `/learn/${BlogSlug}`;
export interface EditorialRouteDefinition {
  canonical: EditorialRoutePath;
  description: string;
  h1: string;
  path: EditorialRoutePath;
  published: boolean;
  title: string;
}
export const EDITORIAL_ROUTE_REGISTRY: readonly EditorialRouteDefinition[] = [
  {
    canonical: "/learn",
    description:
      "Practical guides to image optimization, website image audits, PageSpeed, GTmetrix, and responsive image delivery for developers.",
    h1: "Image optimization, explained.",
    path: "/learn",
    published: true,
    title: "Image Optimization & Web Performance Blog | CompressByURL",
  },
  ...getBlogArticles().map((article): EditorialRouteDefinition => ({
    canonical: `/learn/${article.slug}` as EditorialRoutePath,
    description: article.description,
    h1: article.title,
    path: `/learn/${article.slug}` as EditorialRoutePath,
    published: true,
    title: `${article.seoTitle ?? article.title} | CompressByURL`,
  })),
];
const routeByPath = new Map(EDITORIAL_ROUTE_REGISTRY.map((route) => [route.path, route]));
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
  const article = getBlogArticle(path.slice("/learn/".length));
  const image = article ? articleImage(article) : "/media/blog/audit.webp";
  return {
    alternates: { canonical: route.canonical },
    description: route.description,
    authors: article ? [{ name: BLOG_AUTHOR.name, url: BLOG_AUTHOR.path }] : undefined,
    openGraph: {
      description: route.description,
      title: route.title,
      type: article ? "article" : "website",
      url: route.canonical,
      images: [
        {
          url: image,
          width: 1440,
          height: 960,
          alt: article?.imageAlt ?? "Image audit illustration",
        },
      ],
      ...(article
        ? {
            publishedTime: article.publishedOn,
            modifiedTime: article.modifiedOn,
            authors: [BLOG_AUTHOR.name],
            section: article.category,
          }
        : {}),
    },
    title: { absolute: route.title },
    twitter: {
      card: "summary_large_image",
      description: route.description,
      title: route.title,
      images: [image],
    },
  };
}
