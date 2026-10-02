# Editorial expansion: audit, research, and implementation

Research date: October 2, 2026. Scope: editorial expansion, not changes to the compression or URL-fetching engine.

## Audit and priorities

The live homepage provides real tools and workflow explanations, but no discoverable guide section. `/learn` lists three short guides without cover art, categories, search, or bylines. Article pages have a collapsed outline and sources, but no persistent desktop navigation or author identity. Article JSON-LD hardcodes one date and omits author/image. The registry-driven sitemap is a sound foundation. Legal pages exist; the advertising integration and consent configuration need a separate owner decision before ads are enabled. No AdSense approval outcome can be promised by this content work.

## Research method and limits

Search results were inspected for specific queries about GTmetrix sizing/encoding, PageSpeed image delivery, responsive images, and Next.js sizes. Technical evidence was checked against Google Chrome, web.dev, MDN, Next.js, GTmetrix, and WordPress documentation. These establish terminology and problem intent, not search volume, difficulty, or predicted rank. No keyword-data account or Search Console export was supplied. Priority below reflects product fit and specificity, not a fabricated SEO score.

Search samples: `GTmetrix properly size images efficiently encode images`, `PageSpeed improve image delivery images`, `Next.js sizes image oversized`, `website image audit oversized images srcset`.

## Pillars and topic ownership

| Pillar | Audience/job | Hub | Product connection |
| --- | --- | --- | --- |
| Web performance | Diagnose an image-related speed warning | Image-focused PageSpeed checklist | Resize/compress first; validate in a real browser |
| Website audits | Find and prioritize assets on one page | Existing large-image audit guide | Website scanner and replacement bundle |
| Developer guides | Implement responsive delivery correctly | Responsive srcset/sizes guide | Generate static variants locally |
| Image optimization | Make a visual quality/file-size decision | Existing format comparison | Converter, target size, batch compressor |

## New article plan

All are informational, searchable implementation guides. Each has its own diagnostic question, worked example or decision table, limitations, primary references, and relevant tool links. Similar transactional keywords remain owned by existing tool pages.

| Priority | Article / primary long-tail phrase | Distinct reader payoff |
| --- | --- | --- |
| 1 | Fix PageSpeed improve image delivery | Separate sizing, encoding, and loading issues |
| 1 | GTmetrix properly size images fix | Correct actual delivered dimensions |
| 1 | GTmetrix efficiently encode images fix | Evaluate quality without blindly resizing |
| 1 | Fix LCP image resource load delay | Diagnose late discovery before compressing |
| 1 | Image optimization checklist for PageSpeed | Repeatable image-only triage |
| 1 | Responsive images srcset sizes guide | Explain slot width, DPR, and candidate choice |
| 1 | Next.js Image sizes too large | Correct sizes for a real layout |
| 2 | LCP image lazy loading fix | Distinguish critical and offscreen images |
| 2 | Images cause cumulative layout shift | Reserve aspect ratio before download |
| 2 | GTmetrix next gen image formats | Deploy converted bytes, not renamed extensions |
| 2 | Avoid enormous network payloads images | Prioritize aggregate page weight |
| 2 | PageSpeed vs GTmetrix image results | Reconcile test settings and field data |
| 2 | Find oversized images Chrome DevTools | Identify currentSrc and transferred bytes |
| 2 | Website image scanner limitations | Separate HTML discovery from rendered behavior |
| 2 | WordPress image optimization without plugin | Update media and templates carefully |
| 2 | CSS background image LCP optimization | Make an otherwise late resource discoverable |
| 3 | Why converted WebP is bigger than JPEG | Explain re-encoding and quality tradeoffs |
| 3 | Compress PNG screenshots without blurry text | Choose lossless and right dimensions |
| 3 | Compress images to 200KB without losing clarity | Search dimensions and quality honestly |
| 3 | Image URL CORS compression errors | Distinguish browser permissions from public fetch |

## Implementation contract

1. Preserve existing URLs. Following the owner's October 2 browser feedback, use a staggered two-day publication-date cadence from August 18 through October 1. These are owner-assigned editorial dates; October 2 remains the modification date.
2. Use one typed content model for route metadata, full server-rendered body, author, dates, image, category, sources, and related links. Avoid a CMS or new dependencies.
3. Add a manual scroll-snap homepage carousel with visible previous/next controls and View all. Keep links in server-rendered HTML, lazy-load covers, and respect reduced motion.
4. Add a featured article and SSR category/search navigation to the listing. Query variants are canonicalized to `/learn` and noindexed. Empty searches have recovery links.
5. Add an illustrated article header, real byline, short answer, desktop TOC, mobile outline, code/table support, FAQs, related guides, and tool sidebar. The article spans the site container; the sidebar follows the main page scroll without a nested scrollbar. Use Saipavan V's name and a topic-based bio, never invented expertise.
6. Give all 23 articles their own technical diagram and readable topic title. Save original SVG artwork, rendered WebP covers, and a manifest in `public/media/blog/covers`. The initial six generated artworks remain available, but the blog uses the unique covers.
7. Add a public author profile; update Article/Breadcrumb/ProfilePage/CollectionPage markup, social images, actual dates, and sitemap lastmod. Keep unrelated routes and privacy behavior unchanged.
8. Validate TypeScript, lint, formatting, rendered desktop/mobile pages, content/source/image/link coverage, and a final release build before the user-requested push. Do not create unit/e2e suites or separate reviewer agents.

## Design contract

Mode: Read. Preserve `design.md`. Warm white canvas and violet ink; one dark featured-story composition, quiet lavender accents, 24–32px image frames, 400-weight Inter headings. Wide listing grid with a category-only sidebar; article body and navigation span the site container. The main page owns scrolling. Each cover explains its own technical topic with vector artwork and readable text. No fake ratings, stock avatars, or autoplay.

## Measurement and distribution

After deployment, submit the updated sitemap through the existing Search Console property and monitor index coverage. Compare impressions, clicks, queries, and tool-entry visits over subsequent weeks. Improve pages with actual query evidence; do not multiply pages to chase synonym keywords. Prepare a short practical tip and a source-linked developer discussion from each useful guide; publication to external communities remains an owner action. Maintain technical sources when browser/framework guidance changes.

## Primary research

- [Chrome: improve image delivery](https://developer.chrome.com/docs/performance/insights/image-delivery)
- [GTmetrix: image sizing](https://gtmetrix.com/properly-size-images.html)
- [GTmetrix: encoding](https://gtmetrix.com/efficiently-encode-images.html)
- [GTmetrix: next-generation formats](https://gtmetrix.com/serve-images-in-next-gen-formats.html)
- [Google: PageSpeed lab and field data](https://developers.google.com/speed/docs/insights/v5/about)
- [MDN: responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
- [Next.js: Image](https://nextjs.org/docs/app/api-reference/components/image)
- [web.dev: LCP diagnosis](https://web.dev/articles/optimize-lcp)
- [Google: AdSense content readiness](https://support.google.com/adsense/answer/7299563?hl=en)

## Release verification — October 2, 2026

Implemented all 20 planned new guides, expanded three existing guides, and shipped
six generated 1440×960 WebP artworks with their prompt provenance. Content model
inspection found no missing sources, image assets, or related links. All 23
articles and 31 linked destinations passed inspection in the production render.
The sitemap contains 49 canonical pages; the existing SEO verifier passed against
the local production build. TypeScript, changed-file formatting, and release
build passed. Lint has no errors and 94 pre-existing vendored-script warnings;
full formatting still flags 64 untouched files. No unit/e2e suites or separate
reviewer loops were run. A narrow-screen inspection identified the global 320px
minimum-width overflow and removed that constraint. The homepage carousel,
category filtering, search recovery, desktop TOC, and mobile outline were checked
in the browser. Design detector advisories led to palette-derived dark tones,
larger small text, and an explicit editorial reading scale in `design.md`.

The AdSense account verification meta tag now matches the existing `ads.txt`
publisher ID. It does not load advertising scripts. Production verification and
Search Console submission follow the push; approval remains Google's decision.

## Remaining external work

AdSense verification status, advertising cookie disclosures, any required certified consent setup, Search Console submission, and Google's review decision remain external gates. This work improves editorial usefulness and discovery; it is not evidence of approval or guaranteed ranking.
