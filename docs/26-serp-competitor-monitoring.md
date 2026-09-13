# 26 — SERP & Competitor Monitoring

Baseline date: 2026-09-14

This is the recurring market-watch record for SEO Phase 21. It complements
Search Console; it does not replace first-party query/page data or claim stable
rank positions from one search snapshot.

## Monitoring cadence

- Monthly: review representative SERPs and the four competitor product surfaces.
- Quarterly: fully re-verify every published competitor comparison claim and its
  visible review date.
- Event-driven: review immediately after a major competitor redesign, a material
  format/limit/privacy change, a new URL-scanning product or a CompressByURL scope change.
- Stay quiet when nothing material changes. Record and notify only a change that
  affects accuracy, intent ownership, product positioning or a next action.

## Stable query sample

Use a signed-out or neutral search context where practical and record country,
device and search engine. Do not treat different locales or personalization as a
ranking movement.

| Cluster | Representative queries | Current canonical owner |
| --- | --- | --- |
| General compression | `image compressor online`, `compress images online` | `/compress-image` |
| Format compression | `compress jpg`, `compress png`, `compress webp` | Format-specific compressor routes |
| Conversion | `image converter`, `jpg to webp`, `png to webp` | Converter hub and pair routes |
| Target size | `compress image to 100kb`, `compress image to 200kb` | Target-size routes |
| Direct URL | `compress image from URL`, `image URL compressor` | `/compress-image-from-url` |
| Webpage audit | `website image scanner`, `find large images on a website` | Scanner and matching Learn guide |
| Webpage optimization | `website image optimizer`, `optimize images from webpage` | `/website-image-optimizer` |
| Alternatives | `TinyPNG alternative`, `Squoosh alternative`, `CompressImage alternative`, `iLoveIMG alternative` | Four reviewed alternative routes |

## Baseline observations — 2026-09-14

Source: a non-personalized web search sample, not Search Console and not a
rank-tracking product. Exact positions are intentionally not recorded because
they are unstable across location, device, time and search context.

- The general compressor space is crowded with browser-local tools. The sample
  surfaced ImagesCompressor, Compress Picture, ImgKilo, image-compress.com,
  imagecompressor.com, ToolBox Image and CompressImages.org alongside established
  brands found in the competitor ledger.
- Local processing, batch intake, multiple static formats, resizing and target-KB
  language are common positioning patterns. They are not sufficient differentiation.
- Search results for TinyPNG alternatives contain many first-party competitor
  comparison articles. Their claims are often stale or self-serving; they are useful
  for discovering messaging changes, never as evidence about TinyPNG.
- The durable CompressByURL angle remains the connected direct-image URL and
  bounded webpage discovery-to-local-optimization workflow, with explicit safety
  and scanner limitations.
- No production CompressByURL result can exist in this baseline because the
  canonical production domain has not been supplied or indexed.

## Competitor watchlist

The claim-level source of truth remains
[`24-competitor-research.md`](./24-competitor-research.md).

| Product | Official surfaces | Material changes to watch |
| --- | --- | --- |
| TinyPNG / Tinify | [web compressor](https://tinypng.com/), [analyzer](https://tinypng.com/analyzer), [Developer API](https://tinify.com/developers) | Local/server boundary, analyzer scope, free batch/conversion limits, formats, URL intake and retention policy |
| Squoosh | [app](https://squoosh.app/), [official repository](https://github.com/GoogleChromeLabs/squoosh) | Batch/ZIP, URL intake, codec list, privacy/analytics language and maintenance state |
| CompressImage.io | [web tool](https://compressimage.io/) | URL/page intake, format expansion, local-processing claim, limits, batch/ZIP and offline behavior |
| iLoveIMG | [compressor](https://www.iloveimg.com/compress-image), [features](https://www.iloveimg.com/features), [pricing](https://www.iloveimg.com/pricing) | Processing/retention policy, formats, quotas/pricing, cloud sources and URL/page intake |

## Material-change thresholds

Notify and open an action when any of these occurs:

- a published competitor statement becomes false, misleading or materially incomplete
- a competitor adds direct image URL or webpage optimization that changes the positioning
- a price/quota mentioned on-page changes
- a supported-format or privacy/retention claim changes
- repeated neutral searches show a new dominant intent or result type for a tracked query
- Search Console later shows meaningful impressions assigned to the wrong canonical page
- two CompressByURL pages consistently compete for the same query cluster
- a new route is supported by real query evidence and distinct working behavior

Do not act on one reordered result, a snippet rewrite or a competitor's unsupported
marketing superlative.

## Review procedure

1. Record date, search engine, country/device context and the exact query sample.
2. Note result types and recurring domains; avoid copying long snippets.
3. Open official competitor sources for any capability change. Third-party pages
   may prompt investigation but cannot verify the claim.
4. Diff the evidence against `24-competitor-research.md` and the four published
   comparison pages.
5. If accuracy changed, update the internal evidence date and public copy together,
   then re-run metadata/schema/crawl checks for affected routes.
6. If only SERP composition changed, wait for Search Console page/query evidence
   before changing route ownership.
7. Append one row to the log. Notify only if a material change or user decision exists.

## Monitoring log

| Review date | Scope | Result | Action |
| --- | --- | --- | --- |
| 2026-09-14 | Four representative search clusters; official TinyPNG, Squoosh, CompressImage.io and iLoveIMG sources | Baseline established; comparison evidence and public pages aligned. General results show local compression is common; production visibility cannot be measured yet. | Preserve URL/page workflow positioning. Start recurring monthly checks; revisit public competitor claims quarterly. |

## Production-only additions

After Search Console is connected, add:

- query and page clicks/impressions/CTR/position for equal 28-day periods
- country/device segmentation where sample size is meaningful
- page-query overlap and canonical selection observations
- annotations for launches, title changes and new routes

Those additions unlock SEO Phase 19. Until then, external SERP samples can protect
claim accuracy and positioning but cannot justify ranking-driven changes.

