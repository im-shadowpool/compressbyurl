import type { MetadataRoute } from "next";

import { absoluteSiteUrl, getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    host: getSiteUrl().origin,
    rules: {
      allow: "/",
      disallow: ["/api/", "/dev/"],
      userAgent: "*",
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
