import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoToolPage } from "@/components/seo/compression-tool-page";
import {
  getCompressionPageContent,
  isCompressionRoutePath,
} from "@/components/seo/compression-page-content";
import {
  getConversionPageContent,
  isConversionRoutePath,
} from "@/components/seo/conversion-page-content";
import {
  isResizeRoutePath,
  RESIZE_PAGE_CONTENT,
} from "@/components/seo/resize-page-content";
import {
  IMAGE_URL_PAGE_CONTENT,
  isImageUrlRoutePath,
} from "@/components/seo/image-url-page-content";
import {
  getTargetSizePageContent,
  isTargetSizeRoutePath,
} from "@/components/seo/target-size-page-content";
import {
  getWebsitePageContent,
  isWebsiteRoutePath,
} from "@/components/seo/website-page-content";
import {
  getCompetitorPageContent,
  isCompetitorRoutePath,
} from "@/components/seo/competitor-page-content";
import {
  createSeoMetadata,
  getPublishedSeoRoutes,
  getSeoRoute,
  type SeoRoutePath,
} from "@/config/seo-routes";

interface ToolRoutePageProps {
  params: Promise<{ tool: string }>;
}

export const dynamicParams = false;

function resolveToolRoute(slug: string) {
  const path = `/${slug}` as SeoRoutePath;
  if (
    !isCompressionRoutePath(path) &&
    !isConversionRoutePath(path) &&
    !isResizeRoutePath(path) &&
    !isTargetSizeRoutePath(path) &&
    !isImageUrlRoutePath(path) &&
    !isWebsiteRoutePath(path) &&
    !isCompetitorRoutePath(path)
  )
    return null;
  const route = getSeoRoute(path);
  return route.published ? route : null;
}

export function generateStaticParams() {
  return getPublishedSeoRoutes()
    .filter(
      (route) =>
        isCompressionRoutePath(route.path) ||
        isConversionRoutePath(route.path) ||
        isResizeRoutePath(route.path) ||
        isTargetSizeRoutePath(route.path) ||
        isImageUrlRoutePath(route.path) ||
        isWebsiteRoutePath(route.path) ||
        isCompetitorRoutePath(route.path),
    )
    .map((route) => ({ tool: route.path.slice(1) }));
}

export async function generateMetadata({
  params,
}: ToolRoutePageProps): Promise<Metadata> {
  const { tool } = await params;
  const route = resolveToolRoute(tool);
  return route
    ? createSeoMetadata(route.path)
    : { robots: { follow: false, index: false } };
}

export default async function ToolRoutePage({ params }: ToolRoutePageProps) {
  const { tool } = await params;
  const route = resolveToolRoute(tool);
  if (!route) notFound();

  if (isCompressionRoutePath(route.path)) {
    return <SeoToolPage content={getCompressionPageContent(route.path)} route={route} />;
  }

  if (isConversionRoutePath(route.path)) {
    return <SeoToolPage content={getConversionPageContent(route.path)} route={route} />;
  }

  if (isResizeRoutePath(route.path)) {
    return <SeoToolPage content={RESIZE_PAGE_CONTENT} route={route} />;
  }

  if (isTargetSizeRoutePath(route.path)) {
    return <SeoToolPage content={getTargetSizePageContent(route.path)} route={route} />;
  }

  if (isImageUrlRoutePath(route.path)) {
    return <SeoToolPage content={IMAGE_URL_PAGE_CONTENT} route={route} />;
  }

  if (isWebsiteRoutePath(route.path)) {
    return <SeoToolPage content={getWebsitePageContent(route.path)} route={route} />;
  }

  if (isCompetitorRoutePath(route.path)) {
    return <SeoToolPage content={getCompetitorPageContent(route.path)} route={route} />;
  }

  notFound();
}
