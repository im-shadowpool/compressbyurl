import { absoluteSiteUrl } from "@/config/site";
import type { EditorialRouteDefinition } from "@/config/editorial-routes";
import {
  articleImage,
  articleWordCount,
  BLOG_AUTHOR,
  getBlogCategory,
} from "@/content/blog";
import type { BlogArticle } from "@/content/blog-types";

export function ArticleStructuredData({
  content,
  route,
}: {
  content: BlogArticle;
  route: EditorialRouteDefinition;
}) {
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
            item: absoluteSiteUrl("/learn"),
            name: "Blog",
            position: 2,
          },
          { "@type": "ListItem", item: url, name: route.h1, position: 3 },
        ],
      },
      {
        "@id": `${url}#article`,
        "@type": "BlogPosting",
        dateModified: content.modifiedOn,
        datePublished: content.publishedOn,
        description: route.description,
        headline: route.h1,
        mainEntityOfPage: url,
        image: absoluteSiteUrl(articleImage(content)),
        inLanguage: "en",
        articleSection: getBlogCategory(content.category)?.name,
        wordCount: articleWordCount(content),
        author: {
          "@type": "Person",
          "@id": `${absoluteSiteUrl(BLOG_AUTHOR.path)}#person`,
          name: BLOG_AUTHOR.name,
          url: absoluteSiteUrl(BLOG_AUTHOR.path),
        },
        publisher: {
          "@type": "Organization",
          name: "CompressByURL",
          url: absoluteSiteUrl("/"),
        },
        citation: content.sources.map((source) => source.url),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
  );
}
