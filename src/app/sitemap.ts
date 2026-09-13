import type { MetadataRoute } from "next";

import { getPublishedEditorialRoutes } from "@/config/editorial-routes";
import { getPublishedSeoRoutes } from "@/config/seo-routes";
import { absoluteSiteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...getPublishedSeoRoutes(), ...getPublishedEditorialRoutes()].map((route) => ({
    url: absoluteSiteUrl(route.path),
  }));
}
