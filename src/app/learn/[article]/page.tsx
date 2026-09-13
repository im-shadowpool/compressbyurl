import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ARTICLE_PATHS,
  getEditorialContent,
  isEditorialArticlePath,
} from "@/components/seo/editorial-content";
import { EditorialPage } from "@/components/seo/editorial-page";
import {
  createEditorialMetadata,
  getEditorialRoute,
  type EditorialRoutePath,
} from "@/config/editorial-routes";

interface ArticlePageProps {
  params: Promise<{ article: string }>;
}

export const dynamicParams = false;

function resolveArticle(slug: string) {
  const path = `/learn/${slug}` as EditorialRoutePath;
  if (!isEditorialArticlePath(path)) return null;
  const route = getEditorialRoute(path);
  return route.published ? route : null;
}

export function generateStaticParams() {
  return ARTICLE_PATHS.map((path) => ({ article: path.split("/").at(-1) }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { article } = await params;
  const route = resolveArticle(article);
  return route
    ? createEditorialMetadata(route.path)
    : { robots: { follow: false, index: false } };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { article } = await params;
  const route = resolveArticle(article);
  if (!route || !isEditorialArticlePath(route.path)) notFound();
  return <EditorialPage content={getEditorialContent(route.path)} route={route} />;
}
