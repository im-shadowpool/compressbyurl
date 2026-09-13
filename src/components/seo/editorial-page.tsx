import Link from "next/link";

import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { SiteFooter, SiteHeader } from "@/components/shell";
import { getSeoRoute } from "@/config/seo-routes";
import type { EditorialRouteDefinition } from "@/config/editorial-routes";

import { ArticleStructuredData } from "./article-structured-data";
import type { EditorialArticleContent } from "./editorial-content";

interface EditorialPageProps {
  content: EditorialArticleContent;
  route: EditorialRouteDefinition;
}

export function EditorialPage({ content, route }: EditorialPageProps) {
  return (
    <div className="editorial-page">
      <SiteHeader />
      <main>
        <header className="editorial-hero">
          <Container size="content">
            <nav aria-label="Breadcrumb" className="editorial-breadcrumb">
              <Link href="/">CompressByURL</Link>
              <MaterialSymbol name="chevron_right" size={20} />
              <Link href="/learn">Learn</Link>
            </nav>
            <p className="editorial-kicker">Field guide · {content.readingTime}</p>
            <h1>{route.h1}</h1>
            <p className="editorial-dek">{content.dek}</p>
            <p className="editorial-reviewed">Reviewed {content.reviewedOn}</p>
          </Container>
        </header>

        <article className="editorial-body">
          <Container size="content">
            <aside className="editorial-summary" aria-labelledby="summary-title">
              <h2 id="summary-title">The short version</h2>
              <ul>
                {content.summary.map((item) => (
                  <li key={item}>
                    <MaterialSymbol name="check_circle" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>

            {content.sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.table ? (
                  <div className="editorial-table-scroll">
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
                                <th key={cell} scope="row">
                                  {cell}
                                </th>
                              ) : (
                                <td key={cell}>{cell}</td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
                {section.bullets ? (
                  <ul className="editorial-list">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {content.sources.length > 0 ? (
              <section className="editorial-sources" aria-labelledby="sources-title">
                <h2 id="sources-title">Primary references</h2>
                <ul>
                  {content.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} rel="external">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </Container>
        </article>

        <aside className="editorial-tools" aria-labelledby="tools-title">
          <Container>
            <div className="editorial-tools__frame">
              <div>
                <p>Put the guide to work</p>
                <h2 id="tools-title">Test with your own image.</h2>
              </div>
              <div className="editorial-tools__links">
                {content.toolLinks.map((tool) => {
                  const toolRoute = getSeoRoute(tool.path);
                  return (
                    <Link href={tool.path} key={tool.path}>
                      <span>
                        <strong>{tool.label}</strong>
                        <small>{tool.description}</small>
                      </span>
                      <MaterialSymbol name="arrow_forward" size={24} />
                      <span className="sr-only">: {toolRoute.h1}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Container>
        </aside>
      </main>
      <SiteFooter />
      <ArticleStructuredData content={content} route={route} />
    </div>
  );
}
