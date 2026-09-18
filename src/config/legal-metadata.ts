import type { Metadata } from "next";

import { getLegalRoute, type LegalRoutePath } from "./legal";

export function createLegalMetadata(path: LegalRoutePath): Metadata {
  const route = getLegalRoute(path);
  return {
    alternates: { canonical: route.path },
    description: route.description,
    openGraph: {
      description: route.description,
      title: `${route.title} | CompressByURL`,
      type: "website",
      url: route.path,
    },
    title: route.title,
  };
}
