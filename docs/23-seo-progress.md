# SEO Implementation Progress

Last updated: 2026-09-14

This is the single execution ledger for
[`17-seo-implementation-roadmap.md`](./17-seo-implementation-roadmap.md). It records
what is implemented, what was verified, what is blocked, and how completion is
calculated. Update this document after every SEO phase.

## Current position

- Active phase: production deployment and measurement closeout — the domain and account properties exist, but the site is not yet reachable
- Phase 1 completion: 67% (2 of 3 deliverables prepared; production connection pending)
- Phase 2 completion: 100%
- Phase 3 completion: 100%
- Phase 4 completion: 100%
- Phase 5 completion: 100%
- Phase 6 completion: 100%
- Phase 7 completion: 100%
- Phase 8 completion: 100%
- Phase 9 completion: 100%
- Phase 10 completion: 100%
- Phase 11 completion: 100%
- Phase 12 completion: 100%
- Phase 13 completion: 100%
- Phase 14 completion: 100%
- Phase 15 completion: 100%
- Phase 16 completion: 100%
- Phase 17 completion: 100%
- Phase 18 completion: 100%
- Phase 19 completion: 0% (blocked until Search Console has production query/page data)
- Phase 20 completion: 100%
- Phase 21 completion: 100% (monitoring system active; reviews continue monthly)
- Roadmap completion: 19 of 21 phases complete (90.5%)
- Next implementation action: deploy to `https://compressbyurl.com`, attach the domain in the hosting provider, then run `npm run verify:seo:production -- https://compressbyurl.com --require-ga`
- Next external action: choose/configure the hosting provider, add its required DNS records, approve consent/privacy behavior, and submit `/sitemap.xml` after the deployment passes
- External inputs required: hosting provider/project connection and approved consent/privacy behavior

Percentages are based on roadmap deliverables, not estimated effort. A phase is
only marked complete when its required production behavior and evidence exist.

## Roadmap status

| Phase | Status | Completion | Evidence / next gate |
| --- | --- | ---: | --- |
| 1. SEO Foundation & Measurement | In progress | 67% | Search Console DNS ownership and a valid GA4 environment ID are now verified; hosting/DNS reachability, consent and live collection remain. |
| 2. Keyword & Intent Map | Complete | 100% | Transactional and informational intents, route ownership, priorities and cannibalization risks are documented below. |
| 3. SEO Route Registry | Complete | 100% | Typed tool registry contains 26 self-canonical definitions, unique metadata/H1s, declarative real-engine presets, publication state and validated related links. |
| 4. Homepage SEO | Complete | 100% | Registry-backed title/H1/meta/canonical, useful server-rendered workflow/privacy copy and valid WebSite + SoftwareApplication JSON-LD are live. |
| 5. Compression Landing Pages | Complete | 100% | Four distinct, indexable pages use the shared engine, enforce route-specific input formats, render unique SSR guidance/FAQs and link only to live tools. |
| 6. Conversion Landing Pages | Complete | 100% | Published the functional converter hub plus highest-priority JPG-to-WebP and PNG-to-WebP pages with real output presets and unique guidance. |
| 7. Resize Landing Page | Complete | 100% | Published one focused `/resize-image` route with its real fit/exact settings promoted first and format-specific variants intentionally deferred. |
| 8. Target-Size Landing Pages | Complete | 100% | Four pages preselect real 100KB/200KB/500KB/1MB worker presets, promote target controls and explain bounded search and Smart Fit honestly. |
| 9. Direct URL Intent Pages | Complete | 100% | One canonical page opens the real Image URL intake, explains safe fetch/local processing boundaries and consolidates wording variants. |
| 10. Website Optimizer Landing Pages | Complete | 100% | Published differentiated optimizer and scanner pages on the real bounded scanner; secondary download intent remains evidence-gated. |
| 11. Internal Linking System | Complete | 100% | All 24 published routes are homepage-reachable through contextual tool, comparison, editorial and restrained shared-navigation paths. |
| 12. Sitemap, Canonicals & Robots | Complete | 100% | Registry-driven sitemap now contains all 24 published URLs; robots policy, self-canonicals, consolidation redirects and hard 404/noindex behavior remain active. |
| 13. Structured Data & Breadcrumbs | Complete | 100% | Homepage WebSite/SoftwareApplication retained; all 19 tool pages have WebApplication/FAQ/BreadcrumbList graphs, including the Phase 15 additions. |
| 14. Competitor Research Framework | Complete | 100% | Dated first-party evidence ledger defines fields, status semantics, source rules, recheck cadence, product/tier boundaries and publication gates. |
| 15. Competitor Alternative Pages | Complete | 100% | Four source-dated alternative pages use the real engine, factual comparison tables, unique guidance and official source links; the 20-route graph is fully reachable. |
| 16. Editorial Content Cluster | Complete | 100% | Learn hub plus three original technical guides are published with Article schema, primary references, worked examples and direct working-tool paths. |
| 17. Core Web Vitals SEO Pass | Complete | 100% | Bounded preview intake, lazy decorative media, action-only workers/codecs/ZIP and reserved media geometry protect the critical render and interaction paths. |
| 18. Crawl & Index QA | Complete | 100% | Full 24-page crawl passed status, uniqueness, canonical, robots, schema, internal-link, fragment, redirect and exclusion checks. |
| 19. Search Console Iteration | Blocked externally | 0% | Requires a deployed canonical domain, verified Search Console property and accumulated query/page data; no ranking changes are invented without it. |
| 20. Backlink & Distribution Plan | Complete | 100% | Launch demo scripts, technical-writeup outline, GitHub README, ethical channel plan, outreach template/ledger and owner gates are prepared. |
| 21. SERP & Competitor Monitoring | Complete / ongoing | 100% | Dated baseline, stable query sample, material-change thresholds, official-source watchlist, log and quiet monthly heartbeat are active. |

## Phase 1 — SEO Foundation & Measurement

### Deliverable status

| Deliverable | Status | Evidence |
| --- | --- | --- |
| Connect Search Console and analytics after domain setup | In progress | `compressbyurl.com` exposes a Google verification TXT record, and the local GA4 environment value matches the expected `G-…` format. The apex currently has no A/AAAA target and HTTPS is unreachable, so production collection cannot start yet. |
| Define organic KPI dashboard | Prepared | KPI definitions, sources, cadence and launch targets are specified below. The dashboard becomes operational when Search Console and GA4 collect production data. |
| Record baseline crawl/index state | Complete for current environment | Repository route and metadata baseline recorded below on 2026-09-14. A production baseline remains intentionally blank until a deployed domain exists. |

### Measurement implementation

- Analytics is disabled in development and when the GA4 measurement ID is absent or malformed.
- The production tag disables Google Signals and ad-personalization signals.
- Search Console ownership is verified via DNS TXT record for the domain property (covering all protocols and subdomains).
- Never send filenames, image bytes, EXIF, page HTML, full submitted URLs, query strings, or scan targets to analytics.
- Before enabling GA4, publish the required privacy disclosure and approve a consent implementation for the jurisdictions being served. The tag scaffold is not a substitute for consent or legal review.

Required production environment values:

```dotenv
NEXT_PUBLIC_SITE_URL=https://compressbyurl.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

After deployment, run the repository's live verifier against the canonical origin:

```bash
npm run verify:seo:production -- https://compressbyurl.com --require-ga
```

When GA4 has been approved and enabled, append `--require-ga`. This verifies the
public sitemap surface, unique page signals, self-canonicals, robots policy,
route-specific JSON-LD, consolidation redirects and negative 404/noindex cases.
It reports whether GA4 and HTML-tag verification are detectable, but account-owned
Search Console verification, sitemap submission and GA4 Realtime/DebugView still
require direct confirmation in those services.

### Organic KPI dashboard definition

Use Search Console as the source of truth for organic discovery and GA4 for
on-site behavior. Compare equivalent periods and annotate launches or major route
changes.

| KPI | Definition | Source | Cadence | Initial decision rule |
| --- | --- | --- | --- | --- |
| Indexed pages | Valid indexed canonical pages divided by submitted indexable pages | Search Console Pages + sitemap | Weekly | Investigate any intended page excluded after discovery/crawl has had time to occur. |
| Organic clicks | Google Search clicks to the site | Search Console Performance | Weekly / 28-day trend | Track by query cluster and landing page; no launch target before baseline exists. |
| Organic impressions | Times site results appeared in Google Search | Search Console Performance | Weekly / 28-day trend | Use growth and query discovery to prioritize later content, not raw volume alone. |
| Organic CTR | Clicks divided by impressions | Search Console Performance | Weekly | Review high-impression pages materially below their query-position peers. |
| Average position | Mean top-result position across impressions | Search Console Performance | Weekly | Treat directionally; segment by page and query cluster before acting. |
| Organic engaged sessions | Engaged sessions attributed to organic search | GA4 Landing page report | Weekly | Diagnose landing-page intent or UX when clicks grow but engagement weakens. |
| Tool-start rate | Organic sessions with `compression_started`, `image_url_submitted`, or `website_scan_started` divided by organic landing sessions | GA4 custom exploration | Weekly | Break down by landing page and tool mode. |
| Tool-success rate | Successful compression/import/scan sessions divided by tool-start sessions | GA4 custom exploration | Weekly | Investigate by safe error code and mode; never attach user content. |
| Organic download rate | Organic sessions reaching an approved download event divided by organic landing sessions | GA4 custom exploration | Weekly | Use as the primary useful-outcome indicator once download events are wired. |
| Core Web Vitals pass rate | URLs rated Good for LCP, INP and CLS | Search Console CWV | Monthly | Keep primary tool routes in Good status; investigate regressions by template. |

Product-event names and allowed properties remain governed by
[`10-observability-analytics.md`](./10-observability-analytics.md). Event wiring is
not claimed complete in Phase 1; only the base production connection is in scope.

### Baseline recorded 2026-09-14

Environment: local repository inspection plus public DNS check for `compressbyurl.com` on 2026-09-14; production deployment unavailable.

| Check | Current baseline | Follow-up phase |
| --- | --- | --- |
| Indexable application routes | `/` only | Phases 3–10 add intentional routes. |
| Development routes | `/dev/ui` and `/dev/worker`; both declare `noindex` and return 404 in production | Phase 18 rechecks deployed behavior. |
| Page title / description | Root defaults exist | Phase 4 finalizes homepage; route phases add unique metadata. |
| Canonical | Not emitted | Phase 3 establishes route metadata; Phase 12 validates all canonicals. |
| Sitemap | No route present | Phase 12. |
| Robots.txt | No route present | Phase 12. |
| Structured data | None present | Phases 4 and 13. |
| Search Console property | Domain ownership verified: public DNS exposes a Google verification TXT record | Submit `/sitemap.xml` and capture Pages/Performance evidence after deployment. |
| GA4 collection | A syntactically valid `G-…` ID is configured locally; no reachable production page exists to collect or verify events | Approve consent behavior, deploy the variable, then confirm Realtime/DebugView. |
| Production crawl/index counts | Not available | Capture immediately after deployment and again after sitemap submission. |
| Organic clicks, impressions, CTR, position | Not available | Establish first reporting baseline after Search Console begins collecting data. |

### Phase 1 completion checklist

- [x] Define KPIs, sources, cadence and decision rules.
- [x] Record the current repository crawl/index baseline without inventing production data.
- [x] Add disabled-by-default production configuration for GA4 and Search Console HTML verification.
- [x] Add a repeatable production-origin verifier for the sitemap, metadata, canonicals, robots, schema, redirects and negative routes.
- [x] Confirm the canonical production URL in `NEXT_PUBLIC_SITE_URL`.
- [x] Create and DNS-verify the Search Console Domain property.
- [x] Create the GA4 web stream and set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in the local deployment environment file.
- [ ] Approve privacy disclosure and consent behavior before the GA4 tag is enabled.
- [ ] Verify live collection in GA4 Realtime/DebugView and record the first Search Console coverage snapshot.

### Phase 1 exit gate

Phase 1 remains **in progress** until the production URL and account-owned service
connections are verified. Repository-only phases may continue while this external
gate remains visible, but Phase 1 must not be marked complete without live evidence.

## Phase 2 — Keyword & Intent Map

Status: **Complete**

This map assigns one primary search intent to one canonical route wherever
possible. Keywords are planning hypotheses from the product and SEO source
documents, not claims of measured search volume. Phase 19 will refine priorities
with real Search Console data.

### Transactional tool intent map

| Cluster | Canonical route | Primary intent | Supporting query language | Required real behavior | Priority |
| --- | --- | --- | --- | --- | --- |
| General compression | `/compress-image` | Compress an image online | image compressor, compress image, reduce image size, compress photos online | Upload mode with Smart compression and all supported static formats | Launch |
| JPEG compression | `/compress-jpg` | Compress JPEG/JPG files | JPG compressor, JPEG compressor, reduce JPG size | Upload mode restricted to JPEG/JPG with format-preserving optimization | Launch |
| PNG compression | `/compress-png` | Compress PNG files | PNG compressor, reduce PNG size, optimize PNG | Upload mode restricted to PNG with lossless PNG optimization selected | Launch |
| WebP compression | `/compress-webp` | Compress WebP files | WebP compressor, reduce WebP size | Upload mode restricted to static WebP with format-preserving optimization | Launch |
| Image conversion hub | `/image-converter` | Convert image formats | image converter, convert image online | Upload mode with output-format control and supported input/output matrix | Launch |
| JPEG to WebP | `/jpg-to-webp` | Convert JPEG/JPG to WebP | convert JPG to WebP, JPEG to WebP converter | JPEG-only intake with WebP output preselected | Launch |
| PNG to WebP | `/png-to-webp` | Convert PNG to WebP | convert PNG to WebP, PNG WebP converter | PNG-only intake with WebP output preselected and transparency support | Launch |
| WebP to JPEG | `/webp-to-jpg` | Convert WebP to JPEG | WebP to JPG, WebP JPEG converter | Static WebP intake with JPEG output and transparency background handling | Secondary |
| PNG to JPEG | `/png-to-jpg` | Convert PNG to JPEG | PNG to JPG, PNG JPEG converter | PNG intake with JPEG output and explicit transparency background handling | Secondary |
| JPEG to PNG | `/jpg-to-png` | Convert JPEG to PNG | JPG to PNG, JPEG PNG converter | JPEG/JPG intake with PNG output preselected | Secondary |
| JPEG to AVIF | `/jpg-to-avif` | Convert JPEG/JPG to AVIF | JPG to AVIF, JPEG AVIF converter | JPEG/JPG intake with static AVIF output preselected | Secondary |
| PNG to AVIF | `/png-to-avif` | Convert PNG to AVIF | PNG to AVIF converter | PNG intake with static AVIF output and transparency support | Secondary |
| Resize | `/resize-image` | Resize an image online | image resizer, resize photo, change image dimensions | Upload mode with resize controls expanded; no format-specific child routes initially | Launch |
| Target 100 KB | `/compress-image-to-100kb` | Compress an image to at most 100 KB | image compressor to 100KB, reduce image to 100 KB | Target-size mode at 100 KB with Smart Fit available | Launch |
| Target 200 KB | `/compress-image-to-200kb` | Compress an image to at most 200 KB | image compressor to 200KB, reduce image to 200 KB | Target-size mode at 200 KB with Smart Fit available | Launch |
| Target 500 KB | `/compress-image-to-500kb` | Compress an image to at most 500 KB | image compressor to 500KB, reduce image to 500 KB | Target-size mode at 500 KB with Smart Fit available | Launch |
| Target 1 MB | `/compress-image-to-1mb` | Compress an image to at most 1 MB | image compressor to 1MB, reduce image to 1 MB | Target-size mode at 1,024 KB with Smart Fit available | Launch |
| Direct image URL | `/compress-image-from-url` | Fetch and compress one image URL | compress by URL, image URL compressor, optimize image from URL | Image URL mode active and imported bytes passed into the local compression engine | Launch / moat |
| Website image optimization | `/website-image-optimizer` | Find and optimize heavy images from a webpage | optimize images from webpage, website image optimizer, compress website images | Website URL scanner, selection, local optimization and replacement ZIP | Launch / moat |
| Website image audit | `/website-image-scanner` | Audit webpage image candidates and issues | website image scanner, find large images on website, scan website images | Real scanner manifest with honest single-page and discovery limitations | Launch / moat |
| Download webpage images | `/download-images-from-url` | Discover and download selected webpage images | download images from URL, extract images from webpage | Scanner plus selected-image import/download; no full-domain crawl claim | Secondary / validate |

### Informational intent map

These are editorial candidates for Phase 16. They must teach the topic and link to
the most relevant working tool; they must not be thin wrappers around a tool page.

| Topic / working slug | Search intent | Primary tool destination |
| --- | --- | --- |
| `/learn/webp-vs-avif-vs-jpeg` | Compare modern image formats and choose an output | `/image-converter` |
| `/learn/image-size-core-web-vitals` | Understand image weight, LCP and page performance | `/website-image-optimizer` |
| `/learn/ideal-hero-image-size` | Choose dimensions and file size for a website hero | `/resize-image` and `/compress-image` |
| `/learn/reduce-image-size-without-losing-quality` | Learn practical compression tradeoffs | `/compress-image` |
| `/learn/how-target-size-compression-works` | Understand iterative quality/dimension search | `/compress-image-to-200kb` |
| `/learn/remove-exif-gps-from-photos` | Understand image metadata privacy | `/compress-image` |
| `/learn/nextjs-image-optimization` | Improve images in Next.js projects | `/website-image-scanner` |
| `/learn/wordpress-image-optimization` | Improve images used on WordPress pages | `/website-image-optimizer` |
| `/learn/find-large-images-on-a-website` | Audit a webpage for heavy image assets | `/website-image-scanner` |
| `/learn/image-url-vs-webpage-url` | Distinguish direct-image fetching from webpage scanning | `/compress-image-from-url` and `/website-image-scanner` |

### Competitor intent map

Competitor routes are deferred until Phase 15 and may only publish after the live
capability verification required by `19-seo-competitor-targeting.md`.

| Candidate route | Intent | Publication gate |
| --- | --- | --- |
| `/tinypng-alternative` | Compare workflows with TinyPNG | Verify current formats, limits, pricing, privacy and batch behavior from primary/live evidence. |
| `/squoosh-alternative` | Compare workflows with Squoosh | Verify local-processing, formats, batch, resize and URL behavior from primary/live evidence. |
| `/compressimage-alternative` | Compare workflows with CompressImage.io | Verify the exact current product/domain and every comparison field. |
| `/iloveimg-alternative` | Compare workflows with iLoveIMG | Verify current formats, limits, pricing, privacy, batch and URL behavior. |

### Route ownership and cannibalization decisions

| Overlap risk | Decision | Reason / validation trigger |
| --- | --- | --- |
| Homepage vs `/compress-image` for “image compressor” | Homepage carries broad brand/value language; `/compress-image` owns the focused generic tool intent. | Keep homepage copy broad enough to introduce URL/scanner differentiation. Reassess using page/query data if both rank for the same terms. |
| `/compress-image-from-url`, `/compress-by-url`, `/image-url-compressor`, `/optimize-image-from-url` | Publish `/compress-image-from-url` as the single canonical page. Do not create the three wording-variant pages initially. | They describe the same direct-image workflow. Only split when Search Console evidence shows materially different intent that can support distinct behavior/content. |
| `/website-image-optimizer` vs `/website-image-scanner` | Keep both because their task outcomes differ: optimization/replacement bundle versus audit/discovery. | Cross-link them and keep titles, H1s, examples and default UI focus distinct. Merge if users and queries do not differentiate them. |
| `/download-images-from-url`, `/download-all-images-from-webpage`, `/optimize-images-from-webpage` | Start with `/download-images-from-url` only as a secondary page; fold the other wording into optimizer/scanner content. | “All images” can overpromise because the scanner is single-page, capped and cannot discover every script/CSS-loaded asset. Expand only with query evidence and genuinely distinct behavior. |
| General converter vs pair-specific conversion routes | `/image-converter` owns exploratory conversion; pair routes own a fixed input/output job. | Pair pages must preselect and constrain the real engine, explain pair-specific tradeoffs and avoid copied FAQs. |
| General compressor vs format-specific compression routes | General page accepts all supported static formats; child pages restrict intake and explain format-specific behavior. | Unique functional presets and format guidance prevent mere keyword substitution. |
| Target-size pages | Four documented thresholds may exist because each preselects a real value; no additional number pages initially. | Add another threshold only when query data and useful threshold-specific guidance justify it. |
| Resize format variants | Do not create `/resize-jpg`, `/resize-png`, etc. initially. | The user task and engine behavior are the same; Phase 19 query evidence is required before expansion. |
| Tool pages vs learning guides | Tools own action intent; `/learn/*` owns explanation/comparison intent. | Guides should provide original instruction/examples and link into the relevant preset rather than duplicate landing-page copy. |
| Competitor pages vs core tool pages | Competitor pages own explicit alternative/comparison intent only. | No competitor names in generic tool metadata and no publication before dated verification. |

### Phase 2 acceptance checklist

- [x] Map compression, conversion, resize, target-size, direct URL, scanner and competitor intents.
- [x] Separate transactional tool routes from informational guide topics.
- [x] Assign one canonical owner to overlapping direct-URL phrases.
- [x] Record homepage/general-tool, scanner/optimizer, conversion, resize, target-size and competitor cannibalization risks.
- [x] Tie every proposed transactional route to real current or required tool behavior.
- [x] Mark speculative expansion routes as secondary or evidence-gated.
- [x] Avoid search-volume claims because no keyword dataset or Search Console property is available yet.

Phase 2 is complete. Phase 3 must encode these decisions in a typed route registry;
it must not silently reintroduce wording-variant pages rejected above.

## Phase 3 — SEO Route Registry

Status: **Complete**

Authoritative implementation: `src/config/seo-routes.ts`.

### Registry contract

Every planned indexable tool route now declares:

- route path and self-canonical path
- unique title, H1 and meta description
- one discriminated source mode: upload, direct image URL or website URL
- a declarative production-engine preset rather than a second compression path
- accepted static input formats and output format where relevant
- an existing compression preset ID for target-size behavior
- the settings surface that should open for task-specific routes
- related tool routes
- explicit publication state so future sitemap generation cannot expose unfinished pages

The registry intentionally excludes the rejected wording variants
`/compress-by-url`, `/image-url-compressor`, `/optimize-image-from-url`,
`/download-all-images-from-webpage` and `/optimize-images-from-webpage`. Their
language belongs on the canonical routes selected in Phase 2 until real query
evidence supports a split.

### Runtime safeguards

The registry fails fast when:

- a route is not self-canonical
- two entries have the same title
- two entries have the same H1
- a related-tool link points to the same page
- a related-tool link is absent from the registry

`createSeoMetadata()` emits registry-backed canonical, title, description, Open
Graph and Twitter metadata. `getPublishedSeoRoutes()` exposes only entries whose
routes genuinely exist; currently that is the homepage and the four Phase 5
compression routes. Future route phases must flip publication state only when
their working pages ship.

### Verification evidence

- TypeScript strict check passed with the registry's route, preset, format and related-link types.
- ESLint passed with no errors.
- Targeted Prettier check and `git diff --check` passed.
- Existing development server returned HTTP 200 for `/` after the integration.
- Server-rendered homepage output contained the registry title, description, H1, Open Graph title, Twitter card and canonical `http://localhost:3000/`.
- No planned/unimplemented route is marked published.

### Phase 3 acceptance checklist

- [x] Create one central route configuration.
- [x] Include route, title, H1, description, canonical, preset and related tools.
- [x] Model upload, direct-image URL and webpage-scanner modes as discriminated presets.
- [x] Point upload presets at the existing compression preset and output-format types.
- [x] Keep rejected cannibalization variants out of the route registry.
- [x] Track publication separately from planning.
- [x] Integrate the currently published homepage with registry metadata.
- [x] Verify the server-rendered metadata and canonical over HTTP.

Phase 3 is complete. Phase 4 owns the homepage's additional server-rendered
supporting content and WebSite/SoftwareApplication structured data.

## Phase 4 — Homepage SEO

Status: **Complete**

### Implementation

- The homepage consumes its title, meta description, canonical, Open Graph and Twitter metadata from the Phase 3 registry.
- The single H1 remains `Compress images from files or URLs.`, matching the documented strategy.
- Server-rendered supporting content now explains Upload Files, Image URL and Website URL as distinct entry paths into the same local optimization engine.
- Privacy copy distinguishes local-file processing from the limited network fetching required by URL modes.
- Supported static formats, local processing operations and the honest one-image/one-page URL scope are visible in HTML.
- WebSite and SoftwareApplication JSON-LD are emitted from supplied product facts without ratings, user counts or unsupported claims.
- The added editorial layout follows `design.md`: warm near-white canvas, deep-violet ink, restrained periwinkle accents, one dark privacy surface and generous rounding.
- The tool shell now declares `grid-template-columns: minmax(0, 1fr)`, preventing its implicit grid track from expanding to an 858px min-content width and clipping the mobile interface.

### Verification evidence

- Local HTTP response returned 200.
- The server-rendered response contained exactly one H1, the expected canonical, the supporting workflow copy and JSON-LD.
- JSON parsing confirmed an `@graph` with `WebSite` and `SoftwareApplication` types.
- Browser accessibility inspection exposed the intended H1 → H2 → H3 hierarchy and descriptive workflow links.
- Desktop full-page inspection showed a balanced editorial grid and dark privacy surface with no horizontal overflow.
- Mobile inspection after the grid-track correction showed the compressor contained within the viewport; measured tool-stage right edge was 464px inside a 481px viewport.
- Browser console inspection returned no warnings or errors.
- The Impeccable detector returned no findings for the new homepage SEO stylesheet. Its remaining advisories are pre-existing literal micro-type sizes in `tool.css`, outside this phase's single grid-track correction.
- TypeScript, ESLint, Prettier and `git diff --check` passed.

### Phase 4 acceptance checklist

- [x] Finalize the homepage title, H1 and meta description from the strategy.
- [x] Emit a self-canonical homepage URL through Next.js metadata.
- [x] Add useful server-rendered copy rather than hidden or client-only SEO content.
- [x] Explain all three real product modes and their different network/privacy behavior.
- [x] Add truthful WebSite structured data.
- [x] Add truthful SoftwareApplication structured data without unsupported aggregate ratings or claims.
- [x] Verify one H1, metadata, canonical and JSON-LD over HTTP.
- [x] Inspect desktop and mobile layouts and correct discovered horizontal clipping.
- [x] Verify a clean browser console and accessible heading structure.

Phase 4 is complete. Phase 5 will reuse the registry and production tool engine for
the four compression landing pages; it must not duplicate compression logic.

## Phase 5 — Compression Landing Pages

Status: **Complete**

### Implementation

- Published `/compress-image`, `/compress-jpg`, `/compress-png` and `/compress-webp` from the typed route registry.
- All four routes render one shared server component around the existing production tool shell; no codec or compression path was duplicated.
- The generic page accepts JPEG, PNG, WebP and static AVIF. Format pages constrain the browser file picker and reject mismatched verified content before preview decoding.
- Each page has a unique registry-backed title, H1, meta description, canonical, Open Graph and Twitter definition.
- Each route renders unique, useful server-side guidance, factual format notes, privacy/process explanations, use cases and three route-specific FAQs.
- Related-tool cards are generated from the registry and filtered to published routes, preventing links to unfinished tools.
- The layout extends the `design.md` system with the warm surface, dark editorial hero, deep-violet type, periwinkle accents, generous rounding and progressive disclosure in the shared settings rail.

### Verification evidence

- All four routes returned HTTP 200 with distinct title/H1/canonical combinations.
- Server HTML contained three FAQs per route and no links to unpublished tool routes.
- File inputs exposed the expected accept filters: all four supported static formats on `/compress-image`, JPEG-only on `/compress-jpg`, PNG-only on `/compress-png` and WebP-only on `/compress-webp`.
- Browser accessibility inspection confirmed one H1, logical H2/H3 structure, the PNG-only intake message, real settings controls and all three product source modes.
- Desktop inspection showed the editorial hero and shared tool forming one coherent surface.
- Mobile inspection showed a contained page and intentionally scrollable settings rail; measured document width stayed within the viewport and the footer ended at the document boundary.
- Browser console inspection returned no warnings or errors.
- The Impeccable detector returned no findings for the Phase 5 page component or stylesheet.
- TypeScript, ESLint and targeted Prettier checks passed.

### Phase 5 acceptance checklist

- [x] Publish the general image compressor on the shared production engine.
- [x] Publish distinct JPEG/JPG, PNG and WebP compressor routes.
- [x] Apply meaningful route-specific accepted-format presets.
- [x] Keep compression and encoding work in the existing browser worker path.
- [x] Render unique SSR metadata, H1s, format guidance, use cases and FAQs.
- [x] Preserve local-file privacy language and avoid unsupported savings claims.
- [x] Filter related links to working, published routes.
- [x] Verify metadata, canonicals, content, route presets, responsive layout and browser console.

Phase 5 is complete. Phase 6 will reuse the same dynamic route shell and real tool
engine while adding fixed output-format presets and format-pair-specific guidance.

## Phase 6 — Conversion Landing Pages

Status: **Complete**

### Implementation

- Published `/image-converter`, `/jpg-to-webp` and `/png-to-webp`, the launch-priority conversion routes identified in the Phase 2 intent map.
- Kept secondary format pairs unpublished until query evidence or roadmap scope justifies them, avoiding a thin matrix of near-duplicate pages.
- Extended the shared settings provider with typed route defaults. Those defaults apply on the first render and after stored preferences hydrate, while users remain free to change settings afterward.
- The converter hub starts with WebP and accepts all four supported static formats; pair pages restrict verified inputs and preselect WebP in the real encoder settings.
- Added unique server-rendered guidance, factual format notes, transparency behavior, use cases and three FAQs for each route.
- Generalized the existing landing-page content contract and renderer so conversion pages share the production tool, layout and related-link filtering without duplicating the page shell.

### Verification evidence

- All three routes returned HTTP 200 with unique title, H1, description and self-canonical metadata.
- Server HTML contained three route-specific FAQs and the expected file input filters: all supported static formats, JPEG-only and PNG-only.
- Live accessibility state showed `Format WebP` and `PNG only` on `/png-to-webp`, confirming that the URL changes real controls as well as copy.
- Reloading the route preserved the WebP default; no new browser warnings or errors were added.
- Desktop inspection showed the conversion H1 and preset control integrated with the shared tool surface.
- Mobile inspection showed a contained 481px document within the browser's 500px minimum test viewport, with the WebP setting visible in the horizontal settings rail.
- TypeScript and ESLint passed after the provider and route expansion.

### Phase 6 acceptance checklist

- [x] Publish the general image-converter route.
- [x] Publish the highest-priority JPG-to-WebP and PNG-to-WebP pair routes.
- [x] Keep secondary pair routes unpublished rather than generating thin duplicates.
- [x] Preselect the real output format and preserve it through settings hydration.
- [x] Constrain pair-specific intake by verified source format.
- [x] Explain transparency and lossy/lossless tradeoffs without unsupported savings claims.
- [x] Render unique SSR metadata, content and FAQs.
- [x] Include only relevant working internal links.
- [x] Verify presets, metadata, responsive layout and runtime behavior directly.

Phase 6 is complete. Phase 7 will publish the single general resize route and
foreground its existing maximum/exact dimension controls without creating
format-specific resize pages.

## Phase 7 — Resize Landing Page

Status: **Complete**

### Implementation

- Published the single canonical `/resize-image` route and left format-specific resize variants out of the registry, matching the Phase 2 cannibalization decision.
- Added unique server-rendered resize guidance, fit-versus-exact behavior, no-upscale details, use cases and three FAQs.
- Connected each upload route's `settingsPanel` declaration to the shared settings rail. The relevant control is moved first and receives a restrained accent while its advanced controls remain collapsed.
- On `/resize-image`, the promoted Resize control opens the existing production settings for enabling resize, fit/exact behavior, maximum width/height and aspect-ratio handling.
- Related links are filtered to the working compressor and converter pages; the unpublished target-size route is not exposed early.

### Verification evidence

- `/resize-image` returned HTTP 200 with its unique title, H1, description, self-canonical and three FAQs.
- The server-rendered file input accepts JPEG, PNG, WebP and static AVIF.
- Live accessibility state placed `Resize — Original size` first in the settings rail.
- Opening Resize settings exposed the real enable switch and the explicit statement that smaller images are never enlarged.
- Enabling resize exposed `Fit within`, `Exact size`, maximum width and maximum height controls; the test state was restored afterward.
- TypeScript, ESLint and Prettier passed for the route, content and shared settings change.

### Phase 7 acceptance checklist

- [x] Publish one primary `/resize-image` route.
- [x] Do not create format-specific resize pages without query evidence.
- [x] Reuse the existing worker-backed resize implementation.
- [x] Promote the real Resize settings while preserving progressive disclosure.
- [x] Explain fit, exact dimensions, cropping and no-upscale behavior accurately.
- [x] Render unique SSR metadata, content and FAQs.
- [x] Link only to relevant published tools.
- [x] Verify the live resize controls directly.

Phase 7 is complete. Phase 8 will reuse the same durable route-settings contract
for four byte thresholds and foreground the real target-size controls.

## Phase 8 — Target-Size Landing Pages

Status: **Complete**

### Implementation

- Published `/compress-image-to-100kb`, `/compress-image-to-200kb`, `/compress-image-to-500kb` and `/compress-image-to-1mb`.
- Bound each route to its existing target-size compression preset and WebP output; route defaults survive stored-preference hydration.
- Promoted Quality/Target size to the first settings position and retained the actual target radios and Smart Fit switch inside the shared settings sheet.
- Added threshold-specific byte ceilings, use scenarios, SSR guidance and FAQs through one typed content generator, avoiding copied standalone page implementations.
- Explained bounded encoder search, optional dimension reduction and honest impossible-target states without promising fixed quality or savings.

### Verification evidence

- All four routes returned HTTP 200 with unique title/H1/self-canonical combinations and three FAQs each.
- Live `/compress-image-to-100kb` state showed `Quality — Under 100 KB`, `Preset — Under 100 KB` and `Format — WebP` on first render.
- Opening the first control confirmed target-size mode, the selected 100 KB radio and Smart Fit enabled with its 256px shorter-edge floor explanation.
- TypeScript, ESLint and Prettier passed after the four-route expansion.

### Phase 8 acceptance checklist

- [x] Publish 100KB, 200KB, 500KB and 1MB routes.
- [x] Preselect each real target value and foreground the target control.
- [x] Preserve preset values through local-preference hydration.
- [x] Explain quality search, Smart Fit and failure behavior clearly.
- [x] Render useful threshold-specific SSR copy and FAQs.
- [x] Verify unique metadata, canonicals and live controls.

Phase 8 is complete. Phase 9 will publish the one canonical direct-image URL page
selected in Phase 2 and activate the existing Image URL intake rather than creating
duplicate wording variants.

## Phase 9 — Direct URL Intent Pages

Status: **Complete**

### Implementation and verification

- Published only `/compress-image-from-url`; rejected wording variants remain absent from the registry.
- The route opens the existing Image URL mode with its direct public URL field, direct-CORS-first fetch and constrained proxy fallback explanation.
- Added unique SSR metadata, one H1, fetch/local-processing guidance, security boundaries, use cases and three FAQs.
- HTTP verification returned 200 with the expected self-canonical and three FAQs.
- Live accessibility state confirmed Image URL selected, the 25 MB supported-format hint and the safe-fallback disclosure.
- Cross-route QA found and fixed persisted target-size settings leaking into Custom routes. Dedicated Custom pages now reset processing mode, quality, resize and target values while retaining harmless user preferences.
- Reload verification confirmed `Quality — Smart` and `Format — Keep original` on the direct-URL route.
- TypeScript, ESLint, Prettier and `git diff --check` passed (line-ending notices only).

### Phase 9 acceptance checklist

- [x] Publish one canonical direct-image URL route.
- [x] Avoid duplicate wording-variant pages.
- [x] Activate the real Image URL tool.
- [x] Explain direct fetch, constrained fallback and local compression accurately.
- [x] Render unique SSR metadata, content and FAQs.
- [x] Verify route mode and durable defaults directly.

Phase 9 is complete. Phase 10 will differentiate audit, optimization and selected
download outcomes while reusing the bounded single-page Website URL scanner.

## Phase 10 — Website Optimizer Landing Pages

Status: **Complete**

### Implementation

- Published `/website-image-optimizer` and `/website-image-scanner`; kept the secondary `/download-images-from-url` route unpublished because Phase 10 does not require it and Phase 2 marked it for validation.
- Both pages activate the real Website URL mode and pass a typed purpose into the shared scanner.
- Optimizer mode emphasizes selecting up to 20 candidates, bounded import, local worker optimization and the mapped replacement bundle.
- Scanner mode emphasizes candidate inventory, dimensions, formats and issue observations without inventing an aggregate score.
- Added unique SSR metadata, scope facts, use cases, limitations and three FAQs per outcome.
- URL-route assurances now accurately distinguish the network scan/fetch boundary from local optimization.
- Removed the arbitrary percentage-based “potential savings” display. Savings are now discussed only after actual encoding evidence exists.

### Verification evidence

- Both pages returned HTTP 200 with distinct title/H1/self-canonical combinations and three FAQs each.
- Live accessibility state confirmed Website URL selected and different form headings/buttons: `Optimize webpage images` / `Find images to optimize` versus `Audit webpage images` / `Run image audit`.
- Pages visibly state one-page scope, no full-site crawl and no script execution.
- Desktop and mobile inspection showed contained layouts and the correct network/local assurances; browser logs contained no warnings or errors.
- A POST to the real local `/api/website-scan` endpoint for `https://example.com/` returned HTTP 200, the normalized page URL and a valid zero-candidate manifest.
- The Impeccable detector returned no findings. TypeScript, ESLint, Prettier and `git diff --check` passed.

### Phase 10 acceptance checklist

- [x] Publish website optimizer and website scanner pages.
- [x] Use the real bounded Website URL scanner.
- [x] Give optimizer and audit intents distinct functional UI copy.
- [x] Explain single-page/static-HTML discovery limitations honestly.
- [x] Avoid invented scores and unsupported savings claims.
- [x] Render unique metadata, canonicals, SSR content and FAQs.
- [x] Link only to relevant published URL tools.
- [x] Verify responsive UI, clean console and a real scan response.

Phase 10 is complete. Phase 11 will audit the registry graph and establish
contextual pathways across compression, conversion, target-size and URL/scanner
clusters without expanding the global footer.

## Phase 11 — Internal Linking System

Status: **Complete**

### Implementation and verification

- Reused the registry-driven related-tool block on every published landing page; no keyword-heavy global footer was added.
- Changed homepage workflow cards from self-anchors to the canonical compressor, direct-image URL and website scanner pages.
- Connected general and format-specific compression routes to conversion, resize and target-size outcomes.
- Connected the conversion hub and pair pages into target-size routes while retaining format-relevant pathways.
- Target-size routes form a threshold chain and connect onward to direct URL and website optimization workflows.
- Direct URL, scanner and optimizer pages cross-link their distinct outcomes.
- A rendered-HTML graph traversal from `/` reached all 16 published routes. Every non-home route had at least one inbound internal link, and every tool page exposed contextual outbound links.
- TypeScript, ESLint and Prettier passed after the graph update.

### Phase 11 acceptance checklist

- [x] Build contextual related-tool blocks from one registry.
- [x] Connect conversion to target-size routes.
- [x] Connect target-size to direct URL and scanner/optimizer routes.
- [x] Make all published pages reachable from the homepage.
- [x] Avoid orphaned published routes.
- [x] Keep the global footer restrained.
- [x] Verify the rendered graph rather than relying only on registry intent.

Phase 11 is complete. Phase 12 will make the publication registry authoritative for
the sitemap and robots outputs, then verify canonical and non-indexable behavior.

## Phase 12 — Sitemap, Canonicals & Robots

Status: **Complete**

### Implementation and verification

- Added `sitemap.xml` generated exclusively from `getPublishedSeoRoutes()`; it currently contains exactly 16 canonical URLs.
- Added `robots.txt` allowing public pages, disallowing `/api/` and `/dev/`, and declaring the canonical host and sitemap location.
- Centralized site-URL normalization for metadata, sitemap, robots and homepage structured data.
- Added permanent redirects from the consolidated aliases `/compress-by-url`, `/image-url-compressor` and `/optimize-image-from-url` to `/compress-image-from-url`, plus `/optimize-images-from-webpage` to `/website-image-optimizer`.
- Set `dynamicParams = false` for the registry route and explicit `noindex, nofollow` fallback metadata.
- Verified unpublished `/download-images-from-url` and an unknown slug return HTTP 404 with `noindex` instead of the previous soft-200 behavior.
- Audited all 16 published pages over HTTP; every canonical matched its requested route.
- TypeScript, ESLint and Prettier passed.

### Phase 12 acceptance checklist

- [x] Generate a published-route-only sitemap.
- [x] Generate robots directives and advertise the sitemap.
- [x] Validate every published canonical.
- [x] Prevent indexing of unpublished, unknown and development surfaces.
- [x] Configure permanent redirects for intentionally consolidated aliases.
- [x] Avoid timestamp or priority claims unsupported by real change data.
- [x] Verify HTTP status, redirect and metadata behavior directly.

Phase 12 is complete. Phase 13 will add only structured-data types supported by
visible page content and keep breadcrumbs consistent between UI and JSON-LD.

## Phase 13 — Structured Data & Breadcrumbs

Status: **Complete**

### Implementation and verification

- Retained the homepage's supplied-fact `WebSite` and `SoftwareApplication` graph without ratings, review counts or unsupported usage claims.
- Added one reusable tool-page JSON-LD graph containing `BreadcrumbList`, `WebApplication` and `FAQPage` data derived from the same route/content objects rendered visibly.
- Each breadcrumb has exactly two items: CompressByURL and the current tool, with matching canonical URLs.
- Each FAQ graph contains the same three questions and answers visible on its page.
- Structured feature lists are derived from visible fact rows rather than invented capability claims.
- Parsed JSON-LD for all 15 published tool pages: 15 passed type, two-item breadcrumb and three-question FAQ checks.
- Compared JSON-LD breadcrumb names/URLs with visible H1s and requested routes: 15/15 matched.
- Confirmed homepage graph types are `WebSite` and `SoftwareApplication`.
- Article schema is intentionally absent because editorial articles do not exist before Phase 16.
- TypeScript, ESLint and Prettier passed.

### Phase 13 acceptance checklist

- [x] Add BreadcrumbList where useful.
- [x] Keep breadcrumb schema consistent with visible navigation.
- [x] Add truthful WebApplication data to working tools.
- [x] Add FAQPage data only where matching FAQs are visible.
- [x] Validate existing WebSite/SoftwareApplication schema.
- [x] Avoid unsupported ratings, reviews and Article schema.
- [x] Parse and verify every published structured-data graph.

Phase 13 is complete. Phase 14 is a research/evidence gate: it will define the
comparison contract and record dated primary evidence before any competitor page
can be published.

## Phase 14 — Competitor Research Framework

Status: **Complete**

### Implementation and verification

- Created [`24-competitor-research.md`](./24-competitor-research.md) as the dated, updateable source of truth for TinyPNG/Tinify, Squoosh, CompressImage.io and iLoveIMG comparisons.
- Defined exactly what qualifies for local processing, direct image URL, webpage scan, target-size, batch, ZIP, formats, resize, naming, offline/PWA and limits.
- Defined `Yes`, `No`, `Separate product/tier`, `Not verified` and `Volatile` so missing evidence cannot silently become a negative claim.
- Separated free browser workflows from APIs, CDNs, plugins, separate tools and paid tiers.
- Recorded first-party source URLs, access date, narrowly supported facts and product-specific publication cautions.
- Corrected two important positioning risks before page creation: TinyPNG currently advertises a Website Image Analyzer, and local processing is shared with Squoosh and CompressImage.io.
- Recorded open evidence gaps rather than guessing and added a page-level publication checklist plus quarterly/six-month recheck rules.
- Linked the standing competitor targeting policy to the evidence ledger and checked Markdown formatting.

### Phase 14 acceptance checklist

- [x] Define stable comparison fields and qualifying behavior.
- [x] Define evidence statuses and a primary-source hierarchy.
- [x] Manually review the four initial competitors using current official sources.
- [x] Record exact URLs, access date and narrow supported facts internally.
- [x] Separate web-tool facts from API, CDN, plugin, paid-tier and historical evidence.
- [x] Preserve unknowns as research gaps instead of unsupported “No” claims.
- [x] Establish publication-day and recurring recheck gates.
- [x] Keep the framework useful and internally linked without publishing competitor claims prematurely.

Phase 14 is complete. Phase 15 will recheck each relevant live workflow and publish
four distinct, factual alternative pages only after its page-specific evidence
gate passes.

## Phase 15 — Competitor Alternative Pages

Status: **Complete**

### Implementation and verification

- Published `/tinypng-alternative`, `/squoosh-alternative`, `/compressimage-alternative` and `/iloveimg-alternative` from the typed route registry.
- Each route opens the real local upload compressor with all four supported static formats instead of presenting a comparison-only dead end.
- Added one reusable, accessible comparison section with a visible review date, semantic table, official external source links and an explicit change warning.
- Gave each page distinct workflow guidance, facts, use cases, process steps and three FAQs that remain useful without the table.
- Kept comparisons narrow and neutral: shared strengths remain visible, paid/API/separate products are labelled, and unknown capabilities are not converted into negative claims.
- Correctly acknowledges TinyPNG's Website Image Analyzer, Squoosh and CompressImage.io local processing, CompressImage.io batch/ZIP overlap, and iLoveIMG's broader tool suite.
- Added contextual inbound links from established compressor, resize and direct-URL pages. Rendered-HTML traversal reached all 20 published routes with no orphan.
- Verified all four pages return HTTP 200 with unique title, H1, self-canonical, review date, comparison table and three matching FAQ entities.
- The registry-driven sitemap now contains 20 URLs; all 19 non-home pages retain BreadcrumbList, WebApplication and FAQPage graphs.
- Desktop inspection showed the comparison route integrated with the existing hero/tool composition. Mobile inspection confirmed a contained document and an intentionally scrollable comparison table rather than page-level overflow.
- Browser accessibility inspection confirmed table headings, source links, page hierarchy and live tool controls. No new runtime console errors appeared after the corrected route compilation.
- TypeScript, ESLint and Prettier passed; ESLint reported only pre-existing warnings inside local skill helper scripts.

### Phase 15 acceptance checklist

- [x] Publish the four roadmap alternative pages only after dated research exists.
- [x] Reuse the real shared image engine with a meaningful upload preset.
- [x] Make every page useful beyond its comparison table.
- [x] Keep free web tools separate from APIs, paid tiers and adjacent products.
- [x] Cite official current sources and display the review date.
- [x] Avoid unsupported absence, quality, speed and savings claims.
- [x] Add unique metadata, H1, self-canonical, SSR copy, FAQs and structured data.
- [x] Add relevant inbound and outbound internal links with no orphaned routes.
- [x] Verify HTTP output, responsive layout, accessibility structure and code quality directly.

Phase 15 is complete. Phase 16 will publish a small original editorial cluster,
starting with guides that explain format choice, target-size behavior and webpage
image discovery while sending readers to the relevant working tools.

## Phase 16 — Editorial Content Cluster

Status: **Complete**

### Implementation and verification

- Published a crawlable `/learn` hub plus `/learn/webp-vs-avif-vs-jpeg`, `/learn/how-target-size-compression-works` and `/learn/find-large-images-on-a-website`.
- Chose three distinct intents that map directly to live conversion, target-size and webpage-scanner workflows instead of generating the full topic backlog at once.
- Added original worked examples: two format-selection scenarios, an illustrative bounded 200 KB quality search, and a webpage-image audit that separates transfer bytes, intrinsic pixels and rendered dimensions.
- Clearly labels illustrative numbers as examples rather than benchmarks or promised savings.
- Added useful decision tables, concise summaries, limitations, action checklists and primary MDN/WHATWG/web.dev references where external technical facts are used.
- Added a reusable editorial shell with restrained long-form typography, responsive tables, visible review metadata and focused tool calls to action.
- Added truthful Article and three-level BreadcrumbList structured data to each guide; the hub intentionally does not emit Article schema.
- Extended the sitemap from 20 to 24 published URLs and verified unknown `/learn/*` routes return 404.
- Replaced shared header/footer placeholder anchors with canonical tool and Learn routes, making the editorial cluster discoverable from every rendered page without a keyword-stuffed link block.
- Rendered-HTML traversal reached all 24 sitemap URLs from `/` with no orphan.
- Desktop and mobile inspection confirmed readable hierarchy, contained 500 px minimum test width and horizontally scrollable data tables without document overflow.
- All three guides returned HTTP 200 with unique title, H1, description, self-canonical and Article schema. TypeScript, ESLint and Prettier passed; lint warnings remain confined to pre-existing skill helper scripts.

### Phase 16 acceptance checklist

- [x] Publish a focused editorial hub and launch cluster.
- [x] Provide original examples and decision guidance rather than generic filler.
- [x] Connect every guide to the most relevant working tool.
- [x] Add unique metadata, H1, canonical and server-rendered content.
- [x] Add truthful Article and breadcrumb schema to editorial articles.
- [x] Include primary references for externally grounded technical facts.
- [x] Keep tables and typography usable at desktop and mobile widths.
- [x] Include every page in the sitemap and internal-link graph.
- [x] Verify HTTP behavior, schema, responsive layout and code quality directly.

Phase 16 is complete. Phase 17 will use lightweight direct inspection to find and
fix measurable or structurally credible LCP, INP and CLS risks without running the
full production build reserved for release.

## Phase 17 — Core Web Vitals SEO Pass

Status: **Complete**

### Implementation and verification

- Audited the initial render, file-intake event path, worker lifecycle, codec imports, ZIP generation, media sizing, font setup and service-worker timing.
- Replaced all-at-once preview preparation with an ordered, bounded intake queue: at most three previews normally, at most two for a 16 MB file or 64 MB batch, and one for a 32 MB file.
- This closes the concrete memory/interaction risk where a large selected batch could trigger every signature read and browser image decode concurrently before compression began.
- Confirmed compression already uses bounded worker concurrency, halves available logical cores, reduces to two for large pixel workloads and one for huge pixel/byte workloads.
- Confirmed workers are constructed only when compression starts rather than during page hydration.
- Confirmed AVIF and lossless PNG WASM modules load dynamically only on their relevant encoding paths; JSZip loads dynamically only when a ZIP is requested.
- Removed eager image priority from the small decorative dropzone artwork. Server HTML now emits `loading="lazy"` and no image preload while retaining responsive `srcset` and `sizes`.
- Confirmed every current media frame reserves an explicit aspect ratio, result thumbnails declare width/height, and the current registry contains no active video asset, limiting image-driven layout movement.
- Confirmed Inter is self-hosted through Next font handling and important headings/copy are server-rendered rather than delayed behind effects.
- Confirmed service-worker registration waits until window load, keeping installation work off the critical page-loading path.
- Rechecked the homepage and tool route after the change; HTTP rendering, responsive layout and live controls remained intact.
- TypeScript, ESLint and Prettier passed; lint warnings remain confined to pre-existing local skill scripts. A production Lighthouse/CWV baseline is deferred to the deployed production origin because dev-mode timing is not a valid release score.

### Phase 17 acceptance checklist

- [x] Keep the main tool available in server HTML and interactive after hydration.
- [x] Bound both preview preparation and compression concurrency.
- [x] Reduce concurrency for large and huge inputs.
- [x] Keep compression off the React main thread.
- [x] Lazy-load AVIF, PNG optimization and ZIP dependencies by action.
- [x] Avoid unnecessary decorative-media preload competition.
- [x] Reserve image geometry and retain responsive source sizing.
- [x] Defer service-worker registration until after load.
- [x] Verify the optimized paths without running the prohibited regular-phase production build.

Phase 17 is complete. Phase 18 will perform the consolidated crawl/index audit
across every published tool, competitor and editorial route.

## Phase 18 — Crawl & Index QA

Status: **Complete**

### Crawl evidence recorded 2026-09-14

- Crawled all 24 URLs emitted by the local sitemap; every page returned HTTP 200.
- Found exactly 24 unique titles, 24 unique meta descriptions and 24 unique H1s, with one of each required element per page.
- Verified every published page has one self-referencing canonical and no published page emits `noindex`.
- Verified homepage WebSite/SoftwareApplication schema, WebApplication/FAQ/BreadcrumbList graphs on all 19 tool pages, and Article/BreadcrumbList graphs on all three editorial articles. The Learn hub correctly omits Article schema.
- Checked 480 rendered internal link occurrences. Every path resolved and every linked fragment target existed.
- Graph traversal from `/` reached all 24 sitemap pages with no orphan.
- Verified `robots.txt` allows public content, disallows `/api/` and `/dev/`, and advertises the environment's host and sitemap.
- Verified all four consolidation aliases return HTTP 308 to their intended canonical routes.
- Verified the unpublished download route, an unknown root route and an unknown Learn article return HTTP 404 with `noindex`.
- Verified development UI/worker routes remain `noindex` in local development and are excluded from the sitemap; production code continues to hard-404 them.
- No crawl defect required a repair after the Phase 16 navigation correction. TypeScript and `git diff --check` remained clean apart from line-ending notices.

### Phase 18 acceptance checklist

- [x] Crawl every sitemap URL.
- [x] Check status, title, description, H1, canonical and robots state.
- [x] Check route-appropriate structured data.
- [x] Check internal links and fragment targets.
- [x] Check uniqueness across the full published set.
- [x] Check aliases, unknown routes, unpublished routes and development surfaces.
- [x] Confirm there are no orphaned indexable pages.
- [x] Record exact crawl counts and avoid claiming a production index state.

Phase 18 is complete. Phase 19 cannot begin honestly until the production domain,
Search Console verification and query/page data exist. The roadmap proceeds to
Phase 20 while that external gate remains visible, just as repository phases
continued around the open Phase 1 measurement connection.

## Phase 19 — Search Console Iteration

Status: **Blocked externally — 0%**

### Required evidence before work begins

- Confirm the production `NEXT_PUBLIC_SITE_URL` and deploy the current canonical set.
- Verify the Search Console Domain property and submit the production sitemap.
- Allow enough time for discovery and query/page data to accumulate.
- Export equivalent-period page/query metrics including clicks, impressions, CTR and average position.
- Record changes only when the data identifies a specific high-impression/low-CTR page, cannibalization pattern or unmet query intent.

No title rewrite, new landing page or intent split is justified from local code
alone. Phase 19 stays at 0% rather than treating a runbook as search-data
iteration.

## Phase 20 — Backlink & Distribution Plan

Status: **Complete**

### Implementation and verification

- Created [`25-backlink-distribution-plan.md`](./25-backlink-distribution-plan.md) as the execution-ready distribution playbook.
- Prepared three demo scripts covering local batch evidence, direct-URL target-size compression and webpage audit-to-replacement-bundle behavior.
- Prepared a technical writeup outline around browser/server boundaries, workers, lazy codecs, bounded target search, SSRF defense and static scanner limitations.
- Rewrote the repository README introduction to include actual local setup, verification commands, architecture boundaries and the live SEO progress source.
- Recorded launch prerequisites, factual reusable messaging, prohibited claims, channel fit, an owner-approved outreach template, a contact ledger and 7/28/90-day measurement cadence.
- Grounded Show HN and Product Hunt tactics in their current official submission guidance and grounded the anti-link-spam rules in Google Search Central policy.
- Kept external side effects out of scope: no account was created, no post was submitted, no maintainer was messaged and no directory entry was requested without a production URL and owner approval.
- Prettier and `git diff --check` passed for the documentation and README apart from line-ending notices.

### Phase 20 acceptance checklist

- [x] Prepare reusable scripts for the three differentiating product demos.
- [x] Prepare a technical writeup that teaches transferable implementation lessons.
- [x] Upgrade the GitHub README from a starter note to useful project documentation.
- [x] Identify current, rules-based launch/community channels.
- [x] Define an editorial-fit rubric and a one-follow-up maximum.
- [x] Prohibit paid, automated, reciprocal and comment-spam link tactics.
- [x] Create a transparent outreach template and result ledger.
- [x] Gate every external post/message on production readiness and owner approval.

Phase 20 is complete as a plan and asset package. Execution begins only after the
production URL exists. Phase 21 now establishes the dated market baseline and
recurring review mechanism.

## Phase 21 — SERP & Competitor Monitoring

Status: **Complete / ongoing**

### Implementation and verification

- Created [`26-serp-competitor-monitoring.md`](./26-serp-competitor-monitoring.md) with a stable cross-cluster query sample, dated baseline, product watchlist, material-change thresholds, review procedure and append-only log.
- Recorded the 2026-09-14 search snapshot without presenting volatile result order as objective rank tracking.
- The baseline shows local browser processing, batches, format conversion, resize and target-KB language are common in the general compressor market; URL/page discovery remains the product's more durable workflow position.
- Kept third-party result pages in their proper role: discovery signals only. Competitor capability and privacy changes require current official evidence before copy changes.
- Added production-only Search Console fields that will unlock Phase 19 once the site has query/page data.
- Created the active monthly heartbeat `monthly-seo-market-review`, scheduled for the first Monday of each month at 09:00 in the thread's local timezone.
- The heartbeat rechecks representative SERPs and official TinyPNG/Tinify, Squoosh, CompressImage.io and iLoveIMG sources; it updates evidence and affected public copy together only when a material change is verified.
- The heartbeat is instructed not to contact external parties and to stay quiet while nothing actionable changes.
- Prettier and link checks passed for the monitoring record and its references.

### Phase 21 acceptance checklist

- [x] Define a repeatable cross-cluster SERP sample.
- [x] Record a dated qualitative baseline without false precision.
- [x] Monitor the four published competitor comparison subjects from official sources.
- [x] Define material changes and non-actionable noise.
- [x] Keep a dated review log and production-only Search Console fields.
- [x] Establish a quiet recurring review cadence.
- [x] Update claims and evidence together when a verified change occurs.
- [x] Avoid external messages, automated promotion and unsupported ranking conclusions.

Phase 21's monitoring system is active. Repository-controlled work is complete
through the final roadmap phase. Overall completion remains 90.5% because Phase 1
and Phase 19 require a deployed production origin and account-owned measurement
data.

## Change log

| Date | Change |
| --- | --- |
| 2026-09-14 | Verified deployment readiness with a successful Node 24 production build: 24 SEO pages prerendered and both URL API routes emitted as server functions. Pinned Node `24.x` and documented exact Vercel install/build/domain settings; only account-side deployment, DNS and consent remain. |
| 2026-09-14 | Confirmed `compressbyurl.com` as the canonical origin, verified its Google Search Console DNS TXT record and a valid local GA4 measurement-ID format, and updated `.env`. The apex still has no A/AAAA hosting target and HTTPS is unreachable, so deployment, consent approval, sitemap submission and live measurement verification remain. |
| 2026-09-14 | Rechecked deployment inputs: only the localhost `.env.example` exists and no production host, GA4 ID or Search Console token is configured. Added the `verify:seo:production` live-site handoff command and documented its scope; Phase 1 remains 67% pending account-owned setup and evidence. |
| 2026-09-14 | Completed Phase 21 setup: recorded a qualitative SERP/competitor baseline, official-source watchlist and material-change process, then activated a quiet monthly monitoring heartbeat; repository work is complete through Phase 21 with Phases 1 and 19 externally gated. |
| 2026-09-14 | Completed Phase 20: prepared three launch demos, a technical-writeup outline, updated GitHub README, current channel guidance, anti-spam policy, outreach ledger and owner-execution gates; advanced to Phase 21. |
| 2026-09-14 | Completed Phase 18: full 24-page crawl passed unique metadata/H1, canonical, robots, route-specific schema, 480 internal-link/fragment, redirect and noindex/404 checks; recorded Phase 19's production-data blocker and advanced repository work to Phase 20. |
| 2026-09-14 | Completed Phase 17: bounded preview decoding by workload, removed an unnecessary decorative image preload and verified existing action-only workers, lazy codecs/ZIP, reserved media geometry and post-load service-worker registration; advanced to Phase 18. |
| 2026-09-14 | Completed Phase 16: published a Learn hub and three original technical guides with worked examples, primary references, Article schema and real tool paths; expanded and verified the 24-page crawl graph; advanced to Phase 17. |
| 2026-09-14 | Completed Phase 15: published four source-dated competitor alternatives on the shared engine, added accessible evidence tables and official sources, expanded the sitemap to 20 pages and verified full graph reachability; advanced to Phase 16. |
| 2026-09-14 | Completed Phase 14: created the dated first-party competitor evidence ledger, comparison semantics, product/tier boundaries, open-gap register and publication/recheck gates; advanced to Phase 15. |
| 2026-09-14 | Completed Phase 13: added and parsed truthful WebApplication/FAQ/BreadcrumbList graphs on 15 tools, verified visible breadcrumb parity and retained correct homepage schema; advanced to Phase 14. |
| 2026-09-14 | Completed Phase 12: shipped registry-driven sitemap/robots routes, centralized URL handling, four consolidation redirects, 16/16 canonical validation and hard 404/noindex behavior; advanced to Phase 13. |
| 2026-09-14 | Completed Phase 11: made all 16 published routes crawl-reachable through contextual registry links, connected conversion → target-size → URL → scanner clusters and retained a restrained footer; advanced to Phase 12. |
| 2026-09-14 | Completed Phase 10: published distinct optimizer/scanner pages on the real safe single-page workflow, removed an unsupported savings estimate, verified responsive states and a live scan manifest; advanced to Phase 11. |
| 2026-09-14 | Completed Phase 9: published the single canonical direct-image URL page on the real fetch/local engine, verified safe-boundary copy and fixed a cross-route saved-settings leak; advanced to Phase 10. |
| 2026-09-14 | Completed Phase 8: published four byte-target pages with durable production presets, promoted target controls, threshold-specific SSR content and direct verification of Smart Fit; advanced to Phase 9. |
| 2026-09-14 | Completed Phase 7: published the single resize route, promoted its production fit/exact controls, documented no-upscale behavior and retained the evidence gate for format-specific variants; advanced to Phase 8. |
| 2026-09-14 | Completed Phase 6: published the converter hub and two highest-priority format pairs with durable real-engine WebP defaults, verified source constraints, unique SSR guidance and responsive QA; advanced to Phase 7. |
| 2026-09-14 | Completed Phase 5: published four functional compression landing pages on the shared engine with verified format-specific intake, unique SSR content/FAQs, live-only related links and responsive design; advanced to Phase 6. |
| 2026-09-14 | Completed Phase 4: shipped registry-backed homepage SEO metadata/canonical, SSR workflow and privacy content, truthful WebSite/SoftwareApplication JSON-LD, responsive editorial styling and a mobile tool-grid containment fix; verified desktop/mobile, DOM structure and console; advanced to Phase 5. |
| 2026-09-14 | Completed Phase 3: added the typed 22-entry SEO route registry, declarative shared-engine presets, publication gating, runtime invariants and metadata generator; integrated and HTTP-verified the homepage; advanced to Phase 4. |
| 2026-09-14 | Completed Phase 2: assigned transactional, informational and competitor intents; defined route ownership and priorities; documented cannibalization decisions; advanced the active implementation phase to Phase 3 while retaining the external Phase 1 blocker. |
| 2026-09-14 | Created the single SEO progress ledger; audited the four SEO source documents and current route tree; defined the organic KPI dashboard; recorded the local baseline; added disabled-by-default GA4 and Search Console verification configuration. |
