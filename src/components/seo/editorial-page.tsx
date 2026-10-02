import Image from "next/image";
import Link from "next/link";
import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { SiteFooter, SiteHeader } from "@/components/shell";
import { ArticleCard } from "@/components/blog/article-card";
import { ArticleToc } from "@/components/blog/article-toc";
import { AuthorByline } from "@/components/blog/author-byline";
import type { EditorialRouteDefinition } from "@/config/editorial-routes";
import {
  articleImage,
  BLOG_AUTHOR,
  BLOG_CATEGORIES,
  formatBlogDate,
  getBlogCategory,
  getRelatedArticles,
  sectionId,
} from "@/content/blog";
import type { BlogArticle } from "@/content/blog-types";
import { ArticleStructuredData } from "./article-structured-data";

export function EditorialPage({
  content,
  route,
}: {
  content: BlogArticle;
  route: EditorialRouteDefinition;
}) {
  const category = getBlogCategory(content.category);
  const related = getRelatedArticles(content);
  const outline = content.sections.map((section) => ({
    title: section.title,
    id: sectionId(section.title),
  }));
  return (
    <div className="editorial-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <header className="blog-article-header" id="article-top">
          <Container>
            <nav aria-label="Breadcrumb" className="blog-breadcrumb">
              <Link href="/">Home</Link>
              <MaterialSymbol name="chevron_right" size={20} />
              <Link href="/learn">Blog</Link>
              <MaterialSymbol name="chevron_right" size={20} />
              <span>{category?.name}</span>
            </nav>
            <div className="blog-article-header__grid">
              <div className="blog-article-header__copy">
                <Link
                  className="blog-category"
                  href={`/learn?category=${content.category}`}
                >
                  {category?.name}
                </Link>
                <h1>{route.h1}</h1>
                <p className="blog-dek">{content.dek}</p>
                <AuthorByline article={content} />
                {content.modifiedOn !== content.publishedOn ? (
                  <p className="blog-modified">
                    Updated{" "}
                    <time dateTime={content.modifiedOn}>
                      {formatBlogDate(content.modifiedOn)}
                    </time>
                  </p>
                ) : null}
              </div>
              <figure className="blog-article-cover">
                <Image
                  src={articleImage(content)}
                  alt={content.imageAlt}
                  width={1440}
                  height={960}
                  sizes="(max-width: 900px) 95vw, 48vw"
                  preload
                />
                <figcaption>Editorial illustration</figcaption>
              </figure>
            </div>
          </Container>
        </header>
        <Container>
          <div className="blog-article-layout">
            <article className="blog-prose" aria-label={route.h1}>
              <section className="blog-takeaways" aria-labelledby="takeaways-title">
                <h2 id="takeaways-title">The short answer</h2>
                <ul>
                  {content.summary.map((item) => (
                    <li key={item}>
                      <MaterialSymbol name="check" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <details className="blog-mobile-outline">
                <summary>On this page</summary>
                <nav aria-label="Mobile table of contents">
                  <ol>
                    {outline.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.title}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </details>
              {content.sections.map((section) => (
                <section
                  className="blog-prose-section"
                  key={section.title}
                  id={sectionId(section.title)}
                >
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.table ? (
                    <div
                      className="blog-table-scroll"
                      role="region"
                      tabIndex={0}
                      aria-label={`${section.title} comparison table`}
                    >
                      <table>
                        <thead>
                          <tr>
                            {section.table.columns.map((column) => (
                              <th key={column} scope="col">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.table.rows.map((row) => (
                            <tr key={row.join("|")}>
                              {row.map((cell, index) =>
                                index === 0 ? (
                                  <th key={index} scope="row">
                                    {cell}
                                  </th>
                                ) : (
                                  <td key={index}>{cell}</td>
                                ),
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.code ? (
                    <figure className="blog-code">
                      <figcaption>{section.code.caption}</figcaption>
                      <pre
                        tabIndex={0}
                        aria-label={`${section.code.language} code example`}
                      >
                        <code>{section.code.text}</code>
                      </pre>
                    </figure>
                  ) : null}
                  {section.note ? <p className="blog-note">{section.note}</p> : null}
                </section>
              ))}
              {content.faqs.length ? (
                <section className="blog-faq" id="common-questions">
                  <h2>Common questions</h2>
                  {content.faqs.map((faq) => (
                    <details key={faq.question}>
                      <summary>{faq.question}</summary>
                      <p>{faq.answer}</p>
                    </details>
                  ))}
                </section>
              ) : null}
              <section className="blog-sources" id="sources">
                <h2>Sources and further reading</h2>
                <p>
                  Technical references for the concepts in this guide. Examples with
                  hypothetical values are illustrations, not measured results.
                </p>
                <ul>
                  {content.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} rel="external">
                        {source.label}
                        <MaterialSymbol name="north_east" size={20} />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="blog-author-box" aria-labelledby="author-title">
                <div className="blog-avatar" aria-hidden="true">
                  {BLOG_AUTHOR.initials}
                </div>
                <div>
                  <h2 id="author-title">
                    <Link href={BLOG_AUTHOR.path}>{BLOG_AUTHOR.name}</Link>
                  </h2>
                  <p>{BLOG_AUTHOR.bio}</p>
                  <Link href={BLOG_AUTHOR.path}>More about the author</Link>
                </div>
              </section>
            </article>
            <aside className="blog-article-rail" aria-label="Guide navigation and tools">
              <div className="blog-article-rail__sticky">
                <ArticleToc
                  sections={[
                    ...outline,
                    ...(content.faqs.length
                      ? [{ id: "common-questions", title: "Common questions" }]
                      : []),
                    { id: "sources", title: "Sources and further reading" },
                  ]}
                />
                <div className="blog-tool-panel">
                  <h2>Try it with your images</h2>
                  <p>Local files stay on your device.</p>
                  {content.toolLinks.map((tool) => (
                    <Link key={tool.path} href={tool.path}>
                      <span>
                        {tool.label}
                        <small>{tool.description}</small>
                      </span>
                      <MaterialSymbol name="arrow_forward" size={20} />
                    </Link>
                  ))}
                </div>
                <nav className="blog-rail-categories" aria-label="More blog topics">
                  <h2>Explore the topics</h2>
                  {BLOG_CATEGORIES.map((item) => (
                    <Link key={item.id} href={`/learn?category=${item.id}`}>
                      {item.name}
                      <MaterialSymbol name="chevron_right" size={20} />
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>
          </div>
        </Container>
        <section className="blog-related" aria-labelledby="related-title">
          <Container>
            <div className="blog-section-heading">
              <div>
                <h2 id="related-title">Keep going.</h2>
                <p>A few guides for your next useful fix.</p>
              </div>
              <Link href="/learn" className="blog-text-link">
                View all guides <MaterialSymbol name="arrow_forward" />
              </Link>
            </div>
            <div className="blog-related__grid">
              {related.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
      <ArticleStructuredData content={content} route={route} />
    </div>
  );
}
