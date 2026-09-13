# 24 — Competitor Research Record

Last reviewed: 2026-09-14

This is the internal evidence record for SEO Phases 14 and 15. It is not
publication copy. Recheck every claim against the live product immediately before
publishing or materially editing an alternative page.

## Scope and comparison contract

The default comparison subject is each competitor's free browser tool. APIs,
plugins, desktop apps, subscriptions and CDNs are separate products or tiers and
must be labelled as such.

Use these values in research notes:

- **Yes** — a current first-party page or direct live-product observation supports the capability.
- **No** — a current first-party source explicitly says the capability is absent.
- **Separate product/tier** — available only through a distinct API, CDN, plugin, app or paid tier in the cited evidence.
- **Not verified** — current first-party evidence is insufficient. Never publish this as “No.”
- **Volatile** — price, quota or format details that must be rechecked on publication day.

Comparison fields:

| Field | What qualifies |
| --- | --- |
| Local processing | Image encoding happens on the user's device, not merely that the page runs in a browser. |
| Direct image URL | The web tool accepts a public URL for one image; API-only URL ingestion is separate. |
| Webpage scan | The product accepts a webpage URL and discovers or audits image candidates. |
| Target-size mode | The user can request a byte ceiling or target such as 200 KB, not only set quality. |
| Batch handling | The web UI accepts and processes multiple images in one task. |
| ZIP download | The web UI can download a processed batch as one ZIP. |
| Static formats | Formats the compared web workflow can ingest or emit; input and output must not be conflated. |
| Resize | Pixel-dimension controls in the compared web workflow; separate tools or APIs are labelled. |
| Naming rules | User-configurable filename suffix/prefix or equivalent batch naming control. |
| Offline/PWA | First-party evidence that processing works offline or the tool is installable. |
| Pricing/limits | Current free limits and relevant paid gates, always marked volatile. |

## Evidence rules

1. Prefer the live tool, official documentation, official pricing and the
   product owner's repository. Do not use competitor-authored comparison claims as
   evidence about a third party.
2. Record the exact URL, access date, product/tier and the narrow fact it supports.
3. Do not infer a missing feature from navigation, marketing silence or memory.
4. Keep observed UI facts separate from marketing claims and keep API/CDN behavior
   separate from the consumer web tool.
5. Avoid performance, quality and savings superlatives unless a reproducible test
   methodology, inputs and date accompany them. Phase 15 should normally omit
   such claims.
6. Recheck volatile facts on publication day and at least quarterly afterward.
   Recheck privacy/processing claims, formats and product scope at least every six
   months, or sooner after a visible redesign.
7. If evidence conflicts, publish the narrower claim or use “not verified” until
   the vendor clarifies it.

## Current comparison matrix

This matrix records only what the cited official evidence establishes. “Not
verified” cells are research gaps, not negative claims.

| Field | TinyPNG / Tinify web tool | Squoosh web app | CompressImage.io web tool | iLoveIMG web tool |
| --- | --- | --- | --- | --- |
| Local processing | No — uploaded images are retained for up to 48 hours | Yes — compression runs locally | Yes — compression runs in-browser | No — official feature copy says its servers upload, process and download files |
| Direct image URL | Separate product/tier — Tinify Developer API supports URL workflows; web-tool support not verified | Not verified | Not verified | Not verified |
| Webpage scan | Yes — separate Website Image Analyzer tool | Not verified | Not verified | Not verified |
| Target-size mode | Not verified | Not verified | Not verified | Not verified |
| Batch handling | Yes — free web tool accepts up to 20 images | No in a 2021 official FAQ; stale and must be live-rechecked before publication | Yes — unlimited-image claim and bulk workflow | Yes — current pricing table lists batch processing and per-task counts |
| ZIP download | Not verified | Not verified | Yes | Not verified |
| Static formats | Official web page lists JXL, AVIF, WebP, JPEG/JPG, PNG and APNG; conversion choices shown as AVIF, JXL, WebP, JPEG and PNG | “Numerous formats” in official repository; enumerate only after live recheck | JPEG and PNG compression; optional WebP output; GIF/SVG are separate tools | Compressor page lists JPG, PNG, SVG and GIF |
| Resize | Separate product/tier in current API evidence; current web-tool control not verified | Yes in the live app/repository feature set; settings vary by codec | Yes — maximum width/height control | Separate Resize Image tool |
| Naming rules | Not verified | Not verified | Yes — file suffix control | Not verified |
| Offline/PWA | Not verified | PWA/local operation is documented; offline behavior must be live-rechecked | Yes — first-party page says cached/installable after first visit | No for the web workflow implied by server processing and connection requirement; avoid broader offline claims |
| Pricing/limits | Volatile: free web tool says 20 images, 5 MB each; free conversion says up to 3 images | Free/open-source app; no usage quota found in reviewed first-party source | Free; official page claims no image-count or file-size limit | Volatile: Basic is free; compressor table currently shows 30 files and 200 MB per task; Premium shows 120 files and 4 GB |

## Dated product evidence

### TinyPNG / Tinify

Reviewed product: free TinyPNG browser compressor/converter, with the Tinify API
and Website Image Analyzer treated as separate offerings.

| Source | Accessed | Supported facts |
| --- | --- | --- |
| [TinyPNG compressor](https://tinypng.com/) | 2026-09-14 | Current upload UI says up to 20 images at 5 MB each; lists AVIF, JXL, WebP, JPEG and PNG conversion choices; FAQ lists JXL, AVIF, WebP, JPG, PNG and APNG support; states uploads are retained for at most 48 hours; says free conversion is limited to three images. |
| [TinyPNG Website Image Analyzer](https://tinypng.com/analyzer) | 2026-09-14 | The official product navigation describes a website scan that discovers potential image-optimization savings. Verify the analyzer's current output and limits directly before detailed publication claims. |
| [Tinify Developer API](https://tinify.com/developers) | 2026-09-14 | Server/API product for AVIF, WebP, JPEG and PNG workflows; currently advertises 500 free compressions per month. URL ingestion and resize belong to API documentation, not automatically to the free web compressor. |

Publication notes:

- Describe the free web compressor as an upload-based server workflow, not a
  local compressor.
- TinyPNG now has a website analyzer; CompressByURL must not claim webpage
  scanning is unique or absent from TinyPNG.
- Recheck limits, formats and the analyzer immediately before Phase 15 ships.

### Squoosh

Reviewed product: `squoosh.app` and the official GoogleChromeLabs repository.

| Source | Accessed | Supported facts |
| --- | --- | --- |
| [Squoosh app](https://squoosh.app/) | 2026-09-14 | Live browser image-compression application. Use a direct UI check before publishing exact codec/control claims. |
| [Official Squoosh repository](https://github.com/GoogleChromeLabs/squoosh) | 2026-09-14 | README says image compression happens locally and images are not sent to a server; describes support for numerous formats and discloses basic analytics, including before/after file sizes. Latest listed repository commit is from 2024, so freshness should be stated cautiously. |
| [Official Squoosh FAQ](https://github.com/GoogleChromeLabs/squoosh/wiki/FAQ) | 2026-09-14 | Says the web app did not support multi-image processing or a server API, but the page was last edited 2021. This is historical evidence and cannot support a present-tense “no batch” claim without a fresh live check. |

Publication notes:

- Local processing is a shared strength, not a differentiator against Squoosh.
- Focus any useful comparison on workflow shape: CompressByURL's batch queue,
  target-size presets and URL/page modes versus Squoosh's detailed single-image
  controls, but publish only the parts confirmed live.
- Do not imply the official repository is actively maintained beyond the dated
  evidence.

### CompressImage.io

Reviewed product: free browser compressor at `compressimage.io`.

| Source | Accessed | Supported facts |
| --- | --- | --- |
| [CompressImage.io](https://compressimage.io/) | 2026-09-14 | Page and live controls say JPEG/PNG compression occurs in-browser with no server upload; show quality, maximum width/height, file suffix, optional WebP conversion, metadata stripping, multiple-file intake and ZIP download; claim no file-count or file-size limit; FAQ says the cached app can work offline after the first visit. |

Publication notes:

- Treat local processing, batch, ZIP, resize, naming and offline use as shared
  capabilities.
- The strongest currently supported distinction is CompressByURL's direct image
  URL and bounded webpage scanner workflows. Recheck that CompressImage.io has not
  added URL inputs before publication.
- Do not repeat CompressImage.io's performance or carbon claims as objective fact.

### iLoveIMG

Reviewed product: iLoveIMG's free web compressor and official feature/pricing
pages.

| Source | Accessed | Supported facts |
| --- | --- | --- |
| [iLoveIMG compressor](https://www.iloveimg.com/compress-image) | 2026-09-14 | Current compressor lists JPG, PNG, SVG and GIF, supports multi-image intake, and exposes Google Drive and Dropbox import states. |
| [iLoveIMG features](https://www.iloveimg.com/features) | 2026-09-14 | Says servers upload, process and download files; uploaded archives are automatically removed within two hours; describes bulk tools and Drive/Dropbox integration. |
| [iLoveIMG pricing](https://www.iloveimg.com/pricing) | 2026-09-14 | Basic is free; annual Premium currently shows $4/month billed as $48; comparison table lists 30 compressor files and 200 MB per Basic task, versus 120 files and 4 GB for Premium. All pricing and quotas are volatile. |

Publication notes:

- Compare the compression workflow with the compressor, not iLoveIMG's unrelated
  editing suite.
- State the server-processing and two-hour deletion policy neutrally.
- Recheck pricing, quotas, supported formats and cloud integrations on publication
  day; omit price entirely if it is not needed to answer the user's question.

## CompressByURL self-evidence

Competitor pages may compare only against features already live in this
repository:

- Browser-local upload decode, resize, compression, conversion, target-size
  search, naming and ZIP generation.
- JPEG/JPG, PNG, WebP and static AVIF scope; animated formats are excluded.
- Direct public image URL intake with a constrained network fallback, followed by
  local compression.
- Bounded single-page website image discovery, selection and local optimization;
  no full-site crawl and no script execution.
- Published tool routes and presets are defined in `src/config/seo-routes.ts`.

Do not claim broader production limits, uptime, crawl coverage, savings or privacy
guarantees than the implementation and deployed policy support.

## Phase 15 publication gate

Before each alternative page is set to `published: true`:

- [ ] Re-open every source used on that page and update the review date.
- [ ] Directly inspect the current free web workflow at desktop and mobile widths.
- [ ] Resolve or omit every “not verified” cell used by the draft.
- [ ] Keep APIs, paid tiers, plugins and separate tools explicitly labelled.
- [ ] Cite factual comparison claims near the relevant copy.
- [ ] Include useful migration/workflow guidance that stands without the comparison table.
- [ ] Use the real shared CompressByURL engine and a meaningful preset.
- [ ] Verify unique title, H1, description, canonical, SSR content, internal links and structured data.
- [ ] Add a visible “last reviewed” date and an internal next-review date.
- [ ] Schedule the published page for a quarterly claim check in Phase 21.

## Open evidence gaps

- Live-confirm current Squoosh batch, ZIP, target-size, URL and exact static-codec behavior.
- Live-confirm TinyPNG web-compressor resize, ZIP, direct-URL and target-size behavior separately from its API/analyzer.
- Live-confirm whether CompressImage.io has added direct-image or webpage URL intake.
- Live-confirm iLoveIMG ZIP, URL intake, target-size and naming behavior, and whether any relevant capability is a separate tool rather than part of compression.

