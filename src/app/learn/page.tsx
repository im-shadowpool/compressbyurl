import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { SiteFooter, SiteHeader } from "@/components/shell";
import { ArticleCard } from "@/components/blog/article-card";
import { AuthorByline } from "@/components/blog/author-byline";
import {
  articleImage,
  BLOG_CATEGORIES,
  getBlogArticles,
  getBlogCategory,
} from "@/content/blog";
import { createEditorialMetadata, getEditorialRoute } from "@/config/editorial-routes";
import { absoluteSiteUrl } from "@/config/site";

type Query = { category?: string | string[]; q?: string | string[] };
interface LearnProps {
  searchParams: Promise<Query>;
}

export async function generateMetadata({ searchParams }: LearnProps): Promise<Metadata> {
  const query = await searchParams;
  return {
    ...createEditorialMetadata("/learn"),
    ...(query.category || query.q ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function LearnPage({ searchParams }: LearnProps) {
  const query = await searchParams;
  const category =
    typeof query.category === "string" ? getBlogCategory(query.category) : undefined;
  const search = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const articles = getBlogArticles();
  const filtered = articles.filter(
    (article) =>
      (!category || article.category === category.id) &&
      (!search ||
        `${article.title} ${article.description} ${getBlogCategory(article.category)?.name}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const featured = articles[0];
  const route = getEditorialRoute("/learn");
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: route.h1,
    description: route.description,
    url: absoluteSiteUrl("/learn"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: article.title,
        url: absoluteSiteUrl(`/learn/${article.slug}`),
      })),
    },
  };
  return (
    <div className="learn-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <header className="blog-library-header">
          <Container>
            <div>
              <h1>
                Image optimization,
                <br />
                explained.
              </h1>
              <p>
                For the people building a faster web. Practical guides to lighter images,
                better delivery, and the audits that point you in the right direction.
              </p>
            </div>
            <div className="blog-library-header__note">
              <MaterialSymbol name="auto_stories" size={32} />
              <p>
                {articles.length} guides to help you
                <br />
                find the next useful fix.
              </p>
            </div>
          </Container>
        </header>
        {!category && !search && featured ? (
          <section className="blog-featured" aria-label="Featured guide">
            <Container>
              <div className="blog-featured__frame">
                <Link
                  className="blog-featured__image"
                  href={`/learn/${featured.slug}`}
                  aria-hidden="true"
                  tabIndex={-1}
                  prefetch={false}
                >
                  <Image
                    src={articleImage(featured)}
                    alt=""
                    width={1440}
                    height={960}
                    sizes="(max-width: 768px) 95vw, 55vw"
                    preload
                  />
                </Link>
                <div className="blog-featured__copy">
                  <span className="blog-category">
                    {getBlogCategory(featured.category)?.name}
                  </span>
                  <h2>
                    <Link href={`/learn/${featured.slug}`} prefetch={false}>
                      {featured.title}
                    </Link>
                  </h2>
                  <p>{featured.description}</p>
                  <AuthorByline article={featured} />
                  <Link className="blog-text-link" href={`/learn/${featured.slug}`}>
                    Read the guide <MaterialSymbol name="arrow_forward" />
                  </Link>
                </div>
              </div>
            </Container>
          </section>
        ) : null}
        <section className="blog-library" aria-labelledby="all-guides-title">
          <Container>
            <div className="blog-library__layout">
              <aside className="blog-library__sidebar">
                <nav aria-label="Blog categories">
                  <h2>Browse by topic</h2>
                  <Link
                    href="/learn#all-guides-title"
                    aria-current={!category ? "page" : undefined}
                  >
                    <span>All guides</span>
                    <span>{articles.length}</span>
                  </Link>
                  {BLOG_CATEGORIES.map((item) => (
                    <Link
                      href={`/learn?category=${item.id}#all-guides-title`}
                      key={item.id}
                      aria-current={category?.id === item.id ? "page" : undefined}
                    >
                      <span>{item.name}</span>
                      <span>
                        {
                          articles.filter((article) => article.category === item.id)
                            .length
                        }
                      </span>
                    </Link>
                  ))}
                </nav>
                <div className="blog-sidebar-note">
                  <MaterialSymbol name="fact_check" size={32} />
                  <h3>A useful answer first.</h3>
                  <p>
                    Source-linked explanations, worked examples, and clear limits. No
                    universal quality setting or magic performance score.
                  </p>
                  <Link href="/authors/saipavan-v">Meet the author</Link>
                </div>
                <Link className="blog-sidebar-tool" href="/website-image-scanner">
                  <MaterialSymbol name="travel_explore" size={32} />
                  <span>
                    Find your heavy images<small>Open the website scanner</small>
                  </span>
                  <MaterialSymbol name="arrow_forward" />
                </Link>
              </aside>
              <div className="blog-library__results">
                <div className="blog-library__toolbar">
                  <div>
                    <h2 id="all-guides-title">{category?.name ?? "All guides"}</h2>
                    <p aria-live="polite">
                      {filtered.length} {filtered.length === 1 ? "guide" : "guides"}
                      {search ? ` matching “${search}”` : " to explore"}
                    </p>
                  </div>
                  <form
                    action="/learn"
                    method="get"
                    className="blog-search"
                    role="search"
                  >
                    {category ? (
                      <input type="hidden" name="category" value={category.id} />
                    ) : null}
                    <label className="sr-only" htmlFor="blog-search">
                      Search guides
                    </label>
                    <input
                      id="blog-search"
                      name="q"
                      type="search"
                      maxLength={100}
                      defaultValue={search}
                      placeholder="Search guides"
                    />
                    <button type="submit" aria-label="Search guides">
                      <MaterialSymbol name="search" />
                    </button>
                  </form>
                </div>
                {category ? (
                  <p className="blog-library__category-description">
                    {category.description}
                  </p>
                ) : null}
                {filtered.length ? (
                  <div className="blog-library__grid">
                    {filtered.map((article) => (
                      <ArticleCard key={article.slug} article={article} />
                    ))}
                  </div>
                ) : (
                  <div className="blog-empty">
                    <MaterialSymbol name="search_off" size={32} />
                    <h3>No guides match this search.</h3>
                    <p>Try “LCP”, “PNG”, “responsive”, or browse the full library.</p>
                    <Link className="blog-text-link" href="/learn#all-guides-title">
                      View all guides <MaterialSymbol name="arrow_forward" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collection).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
