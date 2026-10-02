import Link from "next/link";
import { Container } from "@/components/layout";
import { MaterialSymbol } from "@/components/icons";
import { getBlogArticles } from "@/content/blog";
import { ArticleCard } from "./article-card";
import { ArticleCarousel } from "./article-carousel";

export function HomeGuides() {
  const featuredSlugs = [
    "fix-pagespeed-improve-image-delivery",
    "find-large-images-on-a-website",
    "responsive-images-srcset-sizes",
    "webp-vs-avif-vs-jpeg",
    "gtmetrix-efficiently-encode-images",
    "compress-images-200kb-clarity",
  ];
  const articles = getBlogArticles();
  return (
    <section className="home-guides" aria-labelledby="home-guides-title">
      <Container>
        <div className="blog-section-heading">
          <div>
            <h2 id="home-guides-title">Small files. A little know-how.</h2>
            <p>Practical notes on lighter images and the websites that serve them.</p>
          </div>
          <Link className="blog-text-link" href="/learn">
            View all guides <MaterialSymbol name="arrow_forward" />
          </Link>
        </div>
        <ArticleCarousel>
          {featuredSlugs.flatMap((slug) => {
            const article = articles.find((item) => item.slug === slug);
            return article ? [<ArticleCard key={slug} article={article} />] : [];
          })}
        </ArticleCarousel>
      </Container>
    </section>
  );
}
