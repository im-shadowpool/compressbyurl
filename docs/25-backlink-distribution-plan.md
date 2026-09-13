# 25 — Backlink & Distribution Plan

Prepared: 2026-09-14

Status: launch assets and operating plan prepared; external publication and
outreach wait for a production URL and explicit owner execution/approval.

The aim is to earn discovery by giving developers, designers and site owners a
working tool or a useful technical artifact. A backlink is an outcome, not the
thing offered.

## Non-negotiable rules

- Do not buy links, automate submissions, trade reciprocal links, mass-message
  maintainers or drop promotional replies into unrelated discussions.
- Follow each community's current rules before posting. If self-promotion is not
  clearly allowed, do not post.
- Disclose that the poster made the product. Never pose as a customer.
- Ask for feedback or editorial consideration, never a guaranteed followed link.
- A paid placement must use the publisher's appropriate sponsored/nofollow
  treatment. Google's current
  [spam policy](https://developers.google.com/search/docs/essentials/spam-policies)
  explicitly treats link creation primarily for ranking manipulation as link spam.
- Do not send filenames, submitted URLs, scan targets or other user content in
  campaign analytics. Campaign tags may identify only the public channel and asset.

## Launch prerequisites

- [ ] Production domain configured in `NEXT_PUBLIC_SITE_URL`.
- [ ] Current 24-URL sitemap and robots output verified on the deployed origin.
- [ ] Privacy notice and consent behavior approved.
- [ ] GA4/Search Console connected if approved; otherwise use privacy-safe server aggregate counts.
- [ ] Three core workflows smoke-tested on production desktop and mobile.
- [ ] Stable support/contact destination available.
- [ ] Final screenshots or recordings show no private URLs, filenames or browser data.

## Reusable launch message

### One sentence

CompressByURL compresses local images in the browser and also turns a direct image
URL or one public webpage into a local optimization workflow.

### Short description

Compress JPEG, PNG, WebP and static AVIF without uploading local files. Paste one
public image URL, or scan one public webpage for discoverable candidates, then use
the same local resize, conversion, target-size, naming and ZIP workflow. URL fetches
are bounded and public-only; the scanner is not a full crawler and does not execute
scripts.

### Claims that must not appear

- “best compression,” “smallest output,” “lossless quality” for lossy encodes or
  an unmeasured percentage saving
- “all processing is offline” when describing URL modes
- “scans an entire website” or “finds every image”
- “more private than Squoosh/CompressImage.io”
- a competitor's current absence, price or quota without same-day evidence

## Demo set

Record each demo as a short silent-first clip with captions, a static poster and no
autoplay audio. Keep the source files generic and redistributable.

### Demo A — Local batch, measured output

Length target: 25–35 seconds.

1. Add three intentionally different static images: a photograph, a transparent
   graphic and an already-efficient WebP.
2. Show Smart mode, then change one shared resize or naming setting.
3. Start the batch and show bounded progress rather than a frozen interface.
4. Pause on original/output bytes and the larger-result case if one occurs.
5. Download a ZIP.

Point: local bytes stay in the browser; results are measured rather than assumed.

### Demo B — Direct image URL to target size

Length target: 20–30 seconds.

1. Paste a stable public image URL owned by the project or licensed for the demo.
2. Show the direct-fetch/safe-fallback boundary without exposing private browsing data.
3. Choose the 200 KB target and show the highest tested passing result or an honest unreachable state.
4. Download the result.

Point: URL intake feeds the same local engine; target size is a bounded search, not
a magic quality value.

### Demo C — One-page audit to replacement bundle

Length target: 35–45 seconds.

1. Scan a stable public demo page owned by the project.
2. Show source types, dimensions and issue observations; explicitly show the
   one-page/no-script limitation.
3. Select a few candidates, fetch them and optimize locally.
4. Download the mapped replacement ZIP.

Point: the differentiator is the connected discovery-to-local-optimization
workflow, not an invented audit score.

## Technical writeup outline

Working title: **Building a browser-first image optimizer without turning the
server into an upload pipeline**

1. The product boundary: local uploads versus public URL fetching.
2. Why compression, resize, target search, naming and ZIP stay in the browser.
3. Worker protocol and workload-aware concurrency.
4. Lazy AVIF/OxiPNG/ZIP loading and explicit static-format scope.
5. Target-size search: encode, measure, bound and fail honestly.
6. SSRF-safe URL validation, DNS/IP checks, redirect revalidation and stream budgets.
7. Static HTML webpage discovery limits versus a rendered crawler.
8. What failed or changed: eliminating all-at-once preview decoding and unsupported savings scores.
9. Reproducible local setup and a link to the public tool.

The writeup should link to the relevant implementation files or a public repository
commit. It should include diagrams or short code excerpts only when they teach a
transferable technique, not to inflate length.

## Channel plan

Every channel is optional. Recheck rules on submission day.

| Priority | Channel | Fit and asset | Launch gate | Conduct |
| --- | --- | --- | --- | --- |
| 1 | Project repository README/release | Canonical architecture, privacy boundary, setup and demo links | Public repository and deployed URL | Keep factual and update it with the product. |
| 1 | Show HN | A working no-signup tool plus technical context and maker availability | Tool is live and non-trivial | Use `Show HN:` title, explain how/why, ask for feedback, never solicit votes. [Current official guidance](https://news.ycombinator.com/showhn.html). |
| 1 | Product Hunt | Direct product URL, short tagline, 240×240 thumbnail, 2+ gallery images and maker comment | Fully usable public product | Submit as the maker; focus on utility/craft and authentic discussion. [Posting guide](https://help.producthunt.com/en/articles/479557-how-to-post-a-product), [featuring guidance](https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines). |
| 2 | Developer publishing profile | Full technical writeup with worker, codec-loading and SSRF lessons | Public code references and reproducible examples | Publish for readers; syndicate with canonical attribution if the platform supports it. |
| 2 | Web-performance communities | Demo C plus the “bytes vs intrinsic vs rendered size” guide | Stable scanner and honest limitations | Share only in an allowed showcase/resources thread and remain available for technical questions. |
| 3 | Curated image/web-tool roundups | One personalized editorial note with exact category fit | Directory is maintained, useful and accepts submissions | Send one note; do not follow up more than once; avoid low-quality bulk directories. |

Hacker News' current broader
[guidelines](https://news.ycombinator.com/newsguidelines.html) say not to use the
site primarily for promotion or solicit votes/comments. The launch must be a real
technical conversation, not a campaign blast.

## Outreach note template

Subject: Possible fit for `[specific collection/category]`: CompressByURL

> Hi `[name]` — I maintain CompressByURL, a browser-first compressor for JPEG,
> PNG, WebP and static AVIF. I thought it might fit `[specific section]` because it
> also accepts one public image URL or scans one public webpage before optimizing
> selected images locally. The tool is `[production URL]`; the privacy and scanner
> boundaries are documented at `[relevant URL]`. If it is not a fit, no reply is
> needed. I made the product and am happy to answer factual questions.

Personalize the bracketed reasoning from the actual collection. Do not send this
template unchanged to a list.

## Outreach ledger

Create rows only after confirming a real editorial fit.

| Date | Publication/community | Exact relevant page | Contact/submission route | Why readers benefit | Asset used | Status | Follow-up date | Result/link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | — | — | — | — | — | Not contacted | — | — |

Allowed statuses: `researching`, `ready for owner approval`, `submitted`,
`declined`, `published`, `closed — no response`. Never turn “no response” into a
repeated sequence.

## Measurement

Review after 7, 28 and 90 days:

- referral visits and useful tool-start rate by public channel
- earned editorial links and the exact linked resource
- mentions that send nofollowed traffic but useful feedback
- demo completion or article engagement only if privacy-approved analytics exist
- Search Console query/page changes after enough data accumulates

Do not evaluate a channel only by followed-link count. A nofollowed link, product
feedback or a technically useful discussion can still be the correct outcome.

## Owner-executed launch checklist

- [ ] Replace every placeholder with the verified production URL.
- [ ] Produce the three demos from project-owned or licensed sources.
- [ ] Publish the technical writeup and add its canonical link to the README.
- [ ] Prepare Product Hunt assets/draft without scheduling until the owner chooses a date.
- [ ] Prepare a Show HN post only when the maker can participate in the discussion.
- [ ] Research no more than ten curated roundup candidates; retain only clear fits.
- [ ] Obtain owner approval before any external submission or message.
- [ ] Record every contact and outcome in the ledger.
- [ ] Feed actual query/page evidence into SEO Phase 19.

