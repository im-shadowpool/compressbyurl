import Link from "next/link";

import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { SiteFooter, SiteHeader } from "@/components/shell";
import {
  getSeoRoute,
  type SeoRouteDefinition,
  type SeoRoutePath,
} from "@/config/seo-routes";
import { ToolModeSwitcher } from "@/features/tool-shell";

import type { SeoToolPageContent } from "./tool-page-content";
import { ToolStructuredData } from "./tool-structured-data";

interface SeoToolPageProps {
  content: SeoToolPageContent;
  route: SeoRouteDefinition;
}

function publishedRelatedRoutes(paths: readonly SeoRoutePath[]) {
  return paths.map(getSeoRoute).filter((route) => route.published);
}

function routeAssurances(route: SeoRouteDefinition) {
  if (route.preset.sourceMode === "website-url") {
    return [
      { icon: "web", label: "Single-page scan" },
      { icon: "shield_lock", label: "Public targets only" },
      { icon: "memory", label: "Local optimization" },
    ] as const;
  }
  if (route.preset.sourceMode === "image-url") {
    return [
      { icon: "link", label: "Direct image fetch" },
      { icon: "shield_lock", label: "Safe fallback" },
      { icon: "memory", label: "Local optimization" },
    ] as const;
  }
  return [
    { icon: "lock", label: "Local processing" },
    { icon: "stacks", label: "Batch ready" },
    { icon: "download", label: "Individual or ZIP download" },
  ] as const;
}

export function SeoToolPage({ content, route }: SeoToolPageProps) {
  const relatedRoutes = publishedRelatedRoutes(route.relatedTools);
  const assurances = routeAssurances(route);

  return (
    <div className="seo-tool-page">
      <SiteHeader />
      <main>
        <section className="seo-tool-hero" aria-labelledby="page-title">
          <Container>
            <div className="seo-tool-hero__frame">
              <nav aria-label="Breadcrumb" className="seo-tool-breadcrumb">
                <Link href="/">CompressByURL</Link>
                <MaterialSymbol name="chevron_right" size={20} />
                <span aria-current="page">{route.h1}</span>
              </nav>
              <div className="seo-tool-hero__copy">
                <h1 id="page-title">{route.h1}</h1>
                <p>{route.description}</p>
              </div>
              <div className="seo-tool-hero__assurances" aria-label="Tool assurances">
                {assurances.map((assurance) => (
                  <span key={assurance.label}>
                    <MaterialSymbol name={assurance.icon} size={20} />
                    {assurance.label}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="seo-tool-engine" aria-label={`${route.h1} tool`}>
          <Container>
            <ToolModeSwitcher preset={route.preset} />
          </Container>
        </section>

        <section className="seo-tool-guide" aria-labelledby="guide-title">
          <Container>
            <div className="seo-tool-guide__intro">
              <h2 id="guide-title">{content.guideTitle}</h2>
              <p>{content.guideIntro}</p>
            </div>

            <dl className="seo-tool-facts">
              {content.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="seo-tool-why">
              {content.why.map((section) => (
                <article key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>

            {content.comparison ? (
              <section className="seo-tool-comparison" aria-labelledby="comparison-title">
                <div className="seo-tool-comparison__heading">
                  <div>
                    <p>Evidence review · {content.comparison.reviewedOn}</p>
                    <h2 id="comparison-title">
                      CompressByURL vs {content.comparison.competitorName}
                    </h2>
                  </div>
                  <p>{content.comparison.intro}</p>
                </div>
                <div className="seo-tool-comparison__scroll">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Workflow</th>
                        <th scope="col">CompressByURL</th>
                        <th scope="col">{content.comparison.competitorName}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {content.comparison.rows.map((row) => (
                        <tr key={row.dimension}>
                          <th scope="row">{row.dimension}</th>
                          <td>{row.compressByUrl}</td>
                          <td>{row.competitor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="seo-tool-comparison__sources">
                  Sources reviewed:{" "}
                  {content.comparison.sources.map((source, index) => (
                    <span key={source.url}>
                      {index > 0 ? ", " : null}
                      <a href={source.url} rel="external">
                        {source.label}
                      </a>
                    </span>
                  ))}
                  . Features and limits can change; verify the linked product before
                  making a decision.
                </p>
              </section>
            ) : null}
          </Container>
        </section>

        <section className="seo-tool-process" aria-labelledby="process-title">
          <Container>
            <div className="seo-tool-process__heading">
              <h2 id="process-title">How it works</h2>
              <p>{content.privacy}</p>
            </div>
            <ol>
              {content.howItWorks.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="seo-tool-use-cases" aria-labelledby="use-cases-title">
          <Container>
            <div className="seo-tool-use-cases__frame">
              <h2 id="use-cases-title">Useful for</h2>
              <ul>
                {content.useCases.map((useCase) => (
                  <li key={useCase}>
                    <MaterialSymbol name="check_circle" size={20} />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section className="seo-tool-faq" aria-labelledby="faq-title">
          <Container size="content">
            <h2 id="faq-title">Questions about {route.h1.toLowerCase()}</h2>
            <div className="seo-tool-faq__list">
              {content.faq.map((item) => (
                <details key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                    <MaterialSymbol name="add" size={24} />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {relatedRoutes.length > 0 ? (
          <nav className="seo-tool-related" aria-labelledby="related-title">
            <Container>
              <h2 id="related-title">{content.relatedHeading}</h2>
              <div>
                {relatedRoutes.map((related) => (
                  <Link href={related.path} key={related.path}>
                    <span>{related.h1}</span>
                    <MaterialSymbol name="arrow_forward" size={20} />
                  </Link>
                ))}
              </div>
            </Container>
          </nav>
        ) : null}
      </main>
      <SiteFooter />
      <ToolStructuredData content={content} route={route} />
    </div>
  );
}
