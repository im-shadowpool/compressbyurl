import type { MetadataRoute } from "next";

import { getPublishedEditorialRoutes } from "@/config/editorial-routes";
import { getPublishedSeoRoutes } from "@/config/seo-routes";
import { LEGAL_ROUTES } from "@/config/legal";
import { absoluteSiteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getPublishedSeoRoutes(),
    ...getPublishedEditorialRoutes(),
    ...LEGAL_ROUTES,
  ].map((route) => ({
    url: absoluteSiteUrl(route.path),
  }));
}
