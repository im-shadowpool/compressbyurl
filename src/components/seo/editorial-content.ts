import type { EditorialRoutePath } from "@/config/editorial-routes";
import { getBlogArticle, getBlogArticles } from "@/content/blog";
import type { BlogArticle } from "@/content/blog-types";

export type EditorialArticlePath = Exclude<EditorialRoutePath, "/learn">;
export type EditorialArticleContent = BlogArticle;
export const ARTICLE_PATHS = getBlogArticles().map(
  (article) => `/learn/${article.slug}` as EditorialArticlePath,
);
export function isEditorialArticlePath(
  path: EditorialRoutePath,
): path is EditorialArticlePath {
  return ARTICLE_PATHS.includes(path as EditorialArticlePath);
}
export function getEditorialContent(path: EditorialArticlePath): BlogArticle {
  const article = getBlogArticle(path.slice("/learn/".length));
  if (!article) throw new Error(`Unknown article: ${path}`);
  return article;
}
