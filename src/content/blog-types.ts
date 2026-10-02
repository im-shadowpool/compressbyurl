import type { SeoRoutePath } from "@/config/seo-routes";

export type BlogCategory =
  "web-performance" | "website-audits" | "developer-guides" | "image-optimization";
export type BlogImage =
  "performance" | "audit" | "responsive" | "formats" | "compression" | "delivery";
export interface BlogSection {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  table?: { columns: readonly string[]; rows: readonly (readonly string[])[] };
  code?: {
    language: "html" | "css" | "javascript" | "tsx";
    text: string;
    caption: string;
  };
  note?: string;
}
export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  seoTitle?: string;
  category: BlogCategory;
  image: BlogImage;
  imageAlt: string;
  publishedOn: string;
  modifiedOn: string;
  dek: string;
  summary: readonly string[];
  sections: readonly BlogSection[];
  sources: readonly { label: string; url: string }[];
  toolLinks: readonly { description: string; label: string; path: SeoRoutePath }[];
  related: readonly string[];
  faqs: readonly { question: string; answer: string }[];
}
