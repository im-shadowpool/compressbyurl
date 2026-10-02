import Image from "next/image";
import Link from "next/link";
import { MaterialSymbol } from "@/components/icons";
import {
  articleImage,
  articleReadingTime,
  formatBlogDate,
  getBlogCategory,
} from "@/content/blog";
import type { BlogArticle } from "@/content/blog-types";

export function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <article className="blog-card">
      <Link
        className="blog-card__image"
        href={`/learn/${article.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        prefetch={false}
      >
        <Image
          src={articleImage(article)}
          alt=""
          width={1440}
          height={960}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 44vw, 28vw"
        />
        <span className="blog-card__arrow">
          <MaterialSymbol name="arrow_outward" size={24} />
        </span>
      </Link>
      <div className="blog-card__meta">
        <span>{getBlogCategory(article.category)?.name}</span>
        <span>{articleReadingTime(article)}</span>
      </div>
      <h3>
        <Link href={`/learn/${article.slug}`} prefetch={false}>
          {article.title}
        </Link>
      </h3>
      <p>{article.description}</p>
      <time dateTime={article.publishedOn}>{formatBlogDate(article.publishedOn)}</time>
    </article>
  );
}
