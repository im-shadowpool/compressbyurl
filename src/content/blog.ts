import { BLOG_ARTICLES } from "./articles";
import type { BlogArticle, BlogCategory } from "./blog-types";

export type BlogSlug = (typeof BLOG_ARTICLES)[number]["slug"];

export const BLOG_AUTHOR = {
  name: "Saipavan V",
  initials: "SV",
  path: "/authors/saipavan-v",
  bio: "Saipavan V writes practical guides for CompressByURL on browser-first image optimization, website image audits, and web performance. His articles connect technical explanations with steps you can verify on your own site.",
} as const;

export const BLOG_CATEGORIES: readonly {
  id: BlogCategory;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "web-performance",
    name: "Web performance",
    description:
      "Understand PageSpeed, GTmetrix, LCP, and the images behind your report.",
    icon: "speed",
  },
  {
    id: "website-audits",
    name: "Website audits",
    description:
      "Find image problems, prioritize fixes, and verify what the browser receives.",
    icon: "travel_explore",
  },
  {
    id: "developer-guides",
    name: "Developer guides",
    description:
      "Build responsive delivery and stable layouts in real website components.",
    icon: "code",
  },
  {
    id: "image-optimization",
    name: "Image optimization",
    description:
      "Make better decisions about formats, dimensions, quality, and file size.",
    icon: "photo_size_select_large",
  },
];

export function getBlogArticles(): readonly BlogArticle[] {
  return BLOG_ARTICLES;
}

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

export function getBlogCategory(id: string) {
  return BLOG_CATEGORIES.find((category) => category.id === id);
}

export function articleImage(article: BlogArticle) {
  return `/media/blog/${article.image}.webp`;
}

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T00:00:00+05:30`));
}

export function articleWordCount(article: BlogArticle) {
  return [
    article.dek,
    ...article.summary,
    ...article.sections.flatMap((section) => [
      ...section.paragraphs,
      ...(section.bullets ?? []),
      ...(section.table?.rows.flat() ?? []),
    ]),
    ...article.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ]
    .join(" ")
    .trim()
    .split(/\s+/).length;
}

export function articleReadingTime(article: BlogArticle) {
  return `${Math.max(1, Math.ceil(articleWordCount(article) / 200))} min read`;
}

export function sectionId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getRelatedArticles(article: BlogArticle) {
  return article.related.flatMap((slug) => {
    const related = getBlogArticle(slug);
    return related ? [related] : [];
  });
}
