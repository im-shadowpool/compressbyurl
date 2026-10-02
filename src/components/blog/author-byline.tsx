import Link from "next/link";
import { articleReadingTime, BLOG_AUTHOR, formatBlogDate } from "@/content/blog";
import type { BlogArticle } from "@/content/blog-types";

export function AuthorByline({ article }: { article: BlogArticle }) {
  return (
    <div className="blog-byline">
      <Link
        className="blog-avatar"
        href={BLOG_AUTHOR.path}
        aria-label={`About ${BLOG_AUTHOR.name}`}
      >
        {BLOG_AUTHOR.initials}
      </Link>
      <div>
        <Link href={BLOG_AUTHOR.path}>{BLOG_AUTHOR.name}</Link>
        <div className="blog-byline__details">
          <time dateTime={article.publishedOn}>
            {formatBlogDate(article.publishedOn)}
          </time>
          <span>{articleReadingTime(article)}</span>
        </div>
      </div>
    </div>
  );
}
