import type { ReactNode } from "react";
import Link from "next/link";

import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { SiteFooter, SiteHeader } from "@/components/shell";

export interface LegalSection {
  body: ReactNode;
  id: string;
  title: string;
}

interface LegalPageProps {
  dateLabel?: string;
  description: string;
  effectiveDate: string;
  sections: readonly LegalSection[];
  summary: readonly string[];
  title: string;
}

export function LegalPage({
  dateLabel = "Effective",
  description,
  effectiveDate,
  sections,
  summary,
  title,
}: LegalPageProps) {
  return (
    <div className="legal-page">
      <SiteHeader />
      <main>
        <header className="legal-hero">
          <Container size="bleed">
            <div className="legal-hero__frame">
              <div className="legal-hero__inner">
                <nav aria-label="Breadcrumb" className="legal-breadcrumb">
                  <Link href="/">CompressByURL</Link>
                  <MaterialSymbol name="chevron_right" size={20} />
                  <span aria-current="page">{title}</span>
                </nav>
                <div className="legal-hero__copy">
                  <h1>{title}</h1>
                  <p>{description}</p>
                </div>
                <p className="legal-effective">
                  {dateLabel} {effectiveDate}
                </p>
              </div>
            </div>
          </Container>
        </header>

        <Container className="legal-layout" size="content">
          <aside className="legal-summary" aria-labelledby="legal-summary-title">
            <div className="legal-summary__sticky">
              <h2 id="legal-summary-title">At a glance</h2>
              <ul>
                {summary.map((item) => (
                  <li key={item}>
                    <MaterialSymbol name="check_circle" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <nav aria-label={`${title} sections`}>
                <p>On this page</p>
                {sections.map((section) => (
                  <a href={`#${section.id}`} key={section.id}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="legal-content">
            {sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.title}</h2>
                <div className="legal-prose">{section.body}</div>
              </section>
            ))}
          </article>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
