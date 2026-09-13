import { absoluteSiteUrl } from "@/config/site";
import type { EditorialRouteDefinition } from "@/config/editorial-routes";

import type { EditorialArticleContent } from "./editorial-content";

interface ArticleStructuredDataProps {
  content: EditorialArticleContent;
  route: EditorialRouteDefinition;
}

export function ArticleStructuredData({ content, route }: ArticleStructuredDataProps) {
  const url = absoluteSiteUrl(route.path);
  const publishedDate = "2026-09-14";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${url}#breadcrumbs`,
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            item: absoluteSiteUrl("/"),
            name: "CompressByURL",
            position: 1,
          },
          {
            "@type": "ListItem",
            item: absoluteSiteUrl("/learn"),
            name: "Learn",
            position: 2,
          },
          {
            "@type": "ListItem",
            item: url,
            name: route.h1,
            position: 3,
          },
        ],
      },
      {
        "@id": `${url}#article`,
        "@type": "Article",
        dateModified: publishedDate,
        datePublished: publishedDate,
        description: route.description,
        headline: route.h1,
        mainEntityOfPage: url,
        publisher: {
          "@type": "Organization",
          name: "CompressByURL",
          url: absoluteSiteUrl("/"),
        },
        text: [
          content.dek,
          ...content.sections.flatMap((section) => section.paragraphs),
        ].join(" "),
      },
    ],
  };

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
