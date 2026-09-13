import type { SeoRouteDefinition } from "@/config/seo-routes";
import { absoluteSiteUrl } from "@/config/site";

import type { SeoToolPageContent } from "./tool-page-content";

interface ToolStructuredDataProps {
  content: SeoToolPageContent;
  route: SeoRouteDefinition;
}

export function ToolStructuredData({ content, route }: ToolStructuredDataProps) {
  const url = absoluteSiteUrl(route.path);
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
            item: url,
            name: route.h1,
            position: 2,
          },
        ],
      },
      {
        "@id": `${url}#web-application`,
        "@type": "WebApplication",
        applicationCategory: "MultimediaApplication",
        description: route.description,
        featureList: content.facts.map((fact) => `${fact.label}: ${fact.value}`),
        name: route.h1,
        operatingSystem: "Any",
        url,
      },
      {
        "@id": `${url}#faq`,
        "@type": "FAQPage",
        mainEntity: content.faq.map((item) => ({
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
          name: item.question,
        })),
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
