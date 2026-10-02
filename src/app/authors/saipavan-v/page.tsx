import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout";
import { SiteFooter, SiteHeader } from "@/components/shell";
import { ArticleCard } from "@/components/blog/article-card";
import { BLOG_AUTHOR, getBlogArticles } from "@/content/blog";
import { absoluteSiteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "Saipavan V — Image Optimization Guides",
  description: BLOG_AUTHOR.bio,
  alternates: { canonical: BLOG_AUTHOR.path },
  openGraph: {
    type: "profile",
    title: "Saipavan V | CompressByURL",
    description: BLOG_AUTHOR.bio,
    url: BLOG_AUTHOR.path,
    images: [{ url: "/media/blog/audit.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saipavan V | CompressByURL",
    description: BLOG_AUTHOR.bio,
    images: ["/media/blog/audit.webp"],
  },
};

export default function AuthorPage() {
  const profile = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteSiteUrl(BLOG_AUTHOR.path),
    mainEntity: {
      "@type": "Person",
      "@id": `${absoluteSiteUrl(BLOG_AUTHOR.path)}#person`,
      name: BLOG_AUTHOR.name,
      description: BLOG_AUTHOR.bio,
      url: absoluteSiteUrl(BLOG_AUTHOR.path),
    },
  };
  return (
    <div className="learn-page">
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <Container>
          <header className="blog-author-header">
            <Link href="/learn">Back to the blog</Link>
            <div className="blog-avatar" aria-hidden="true">
              {BLOG_AUTHOR.initials}
            </div>
            <h1>{BLOG_AUTHOR.name}</h1>
            <p>{BLOG_AUTHOR.bio}</p>
            <p>
              Writing about image optimization, website audits, web performance, and
              developer implementation. Guides include primary references and label
              illustrative examples clearly.
            </p>
            <Link href="/about">About CompressByURL & contact</Link>
          </header>
          <section className="blog-author-articles" aria-labelledby="author-guides">
            <h2 id="author-guides">Guides by {BLOG_AUTHOR.name}</h2>
            <div className="blog-related__grid">
              {getBlogArticles().map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        </Container>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(profile).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  );
}
