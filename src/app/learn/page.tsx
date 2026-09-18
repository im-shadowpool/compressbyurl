import Link from "next/link";

import { MaterialSymbol } from "@/components/icons";
import { Container } from "@/components/layout";
import { MediaFrame } from "@/components/media";
import { SiteFooter, SiteHeader } from "@/components/shell";
import { ARTICLE_PATHS, getEditorialContent } from "@/components/seo/editorial-content";
import { createEditorialMetadata, getEditorialRoute } from "@/config/editorial-routes";
import { media } from "@/lib/media";

export const metadata = createEditorialMetadata("/learn");

const route = getEditorialRoute("/learn");

export default function LearnPage() {
  return (
    <div className="learn-page">
      <SiteHeader />
      <main>
        <header className="learn-hero">
          <Container>
            <div className="learn-hero__frame">
              <p>CompressByURL field notes</p>
              <h1>{route.h1}</h1>
              <div>
                <p>{route.description}</p>
                <span>Three focused guides · reviewed September 14, 2026</span>
              </div>
              <MediaFrame
                asset={media.hero.webGallery}
                className="learn-hero__media"
                priority
                sizes="(max-width: 768px) 92vw, 56vw"
              />
            </div>
          </Container>
        </header>
        <section className="learn-index" aria-labelledby="guide-list-title">
          <Container>
            <h2 className="sr-only" id="guide-list-title">
              Published guides
            </h2>
            <div className="learn-index__grid">
              {ARTICLE_PATHS.map((path, index) => {
                const articleRoute = getEditorialRoute(path);
                const content = getEditorialContent(path);
                return (
                  <article key={path}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p>{content.readingTime}</p>
                      <h2>{articleRoute.h1}</h2>
                      <p>{content.dek}</p>
                    </div>
                    <Link href={path}>
                      Read the guide
                      <MaterialSymbol name="arrow_forward" size={20} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
