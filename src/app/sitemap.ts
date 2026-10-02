import type { MetadataRoute } from "next";

import { getPublishedEditorialRoutes } from "@/config/editorial-routes";
import { getPublishedSeoRoutes } from "@/config/seo-routes";
import { LEGAL_ROUTES } from "@/config/legal";
import { absoluteSiteUrl } from "@/config/site";
import { BLOG_AUTHOR, getBlogArticle, getBlogArticles } from "@/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getPublishedSeoRoutes(),
    ...getPublishedEditorialRoutes(),
    ...LEGAL_ROUTES,
    { path: BLOG_AUTHOR.path },
  ].map((route) => {
    const article = route.path.startsWith("/learn/")
      ? getBlogArticle(route.path.slice(7))
      : undefined;
    const editorialDate =
      article?.modifiedOn ??
      (route.path === "/learn" || route.path === BLOG_AUTHOR.path
        ? getBlogArticles()
            .map((item) => item.modifiedOn)
            .sort()
            .at(-1)
        : undefined);
    return {
      url: absoluteSiteUrl(route.path),
      ...(editorialDate ? { lastModified: editorialDate } : {}),
    };
  });
}
