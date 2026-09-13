# CompressByURL Audit and Implementation Plan

Audit date: 2026-09-13

## Executive summary

The browser compressor is substantially implemented: local upload processing, batch workers, format conversion, resize, target-size search, comparison, ZIP output, image URL intake, website scanning, settings persistence, and PWA plumbing are all present.

The product is not launch-ready against its own project contract yet. The largest gap is SEO and page architecture: the documented indexable tool-page clusters do not exist in the route tree, and the site has no sitemap, robots route, canonical metadata, or structured data. There are also several correctness, performance, security-hardening, accessibility, and release gaps that should be addressed before calling the implementation production-grade.

This plan assumes “launch” means the MVP described in `docs/20-launch-mvp-scope.md`, including the highest-priority SEO pages. If launch is intentionally core-tool-only, the SEO work can move after the first release, but it remains required for the documented product direction.

## Audit scope and confidence

Reviewed the repository instructions, design system, information architecture, technical architecture, security/privacy, performance/accessibility, release, SEO, and implementation-status documents; inspected the application, codec, worker, URL, scanner, API, PWA, and styling code; inspected the available hero media; and ran lightweight runtime smoke checks against the existing development server.

Checks completed:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run format:check` passed.
- `npm audit --omit=dev --audit-level=high` reported no high-severity production dependency vulnerabilities.
- Homepage, manifest, service worker, and SSR metadata were inspected over HTTP.
- The image proxy rejected a loopback destination as expected.

The full production build, automated test suites, and an interactive browser/device pass were not rerun. The repository contract defers those checks during regular phases, and the available browser surface was unavailable for this audit. The “complete” statements in existing status documents are therefore treated as historical claims, not fresh release evidence.

## Current state by area

| Area | Assessment | Remaining work |
| --- | --- | --- |
| Local upload compressor | Core flow is present and worker-backed | Bound intake/preview decoding, add explicit safety limits, improve accessibility and component boundaries |
| Batch processing | Good foundation: bounded worker concurrency and cleanup exist | Benchmark large batches; move ZIP generation to a worker if the benchmark shows UI jank |
| Static codecs | JPEG, PNG, WebP, and AVIF modules exist | Fix the AVIF-to-WebP routing mismatch and harden static animation detection |
| Image URL mode | Browser-first intake with server fallback exists | Add cancellation/stale-request handling and a streaming byte cap on the direct browser path |
| Website scanner | Secure server scan and image proxy foundation exist | Harden rate limiting/body budgets, improve cancellation and result semantics, defer full crawl/headless behavior as documented |
| Security | DNS/IP/redirect/content-type/timeout checks are a strong baseline | Do not trust spoofable forwarded IP headers; add distributed rate-limit strategy, request body limits, and egress-volume accounting |
| UI/design | Visual language broadly follows `design.md`; custom hero media exists | Fix undefined semantic tokens, correct pill geometry, connect dead navigation targets, and add the documented below-fold content |
| SEO | Homepage has title/description/robots/Open Graph basics | Add real tool routes, canonical URLs, SSR copy, sitemap, robots, structured data, and internal linking |
| PWA | Manifest and service worker exist | Make cache/navigation behavior route-aware before adding SEO routes |
| Release operations | Local verification scripts exist | Add CI/deployment checks, production environment verification, observability, and final browser/performance/security QA |
| Documentation | Core status says 36 phases complete | Reconcile the stale roadmap header with `docs/21-implementation-status.md` and this audit |

## Findings, ordered by priority

### P0: launch-scope blockers

1. **The SEO route workstream is effectively unimplemented.** The route tree contains only the homepage and development pages; none of the documented compression, conversion, resize, target-size, direct-URL, or website-optimizer pages exist. This also means the promised page-level presets and SSR content are not available.

2. **The homepage is missing foundational SEO output.** Runtime inspection found no canonical link and no JSON-LD structured data. There is also no `sitemap.xml` or `robots.txt` route. The current header and footer mostly point to `#tool`, `#privacy`, and `#learn`, but the corresponding homepage sections are not present, so several navigation links are dead or misleading.

3. **There is no fresh release evidence for a production build or end-to-end smoke pass.** This is not a reason to run the heavy checks during this audit, but it is a release gate that must be satisfied after implementation work is complete.

### P1: correctness and production-readiness issues

1. **AVIF input cannot currently produce WebP.** `src/codecs/webp/webp-codec.ts` excludes `avif` from `supportsInput`, while the output selector offers WebP and the worker reports encoder unavailability when no codec accepts the pair. Add AVIF decoding support to the WebP path or disable the incompatible option with an explicit explanation.

2. **Several shell styles reference undefined design tokens.** `src/styles/shell.css` uses `--feedback-success-bg`, `--feedback-warning-bg`, `--feedback-error-bg`, `--brand-primary-strong`, and `--brand-ink-primary`, but they are not defined in the token files. Success/error/warning surfaces can therefore lose their intended fills and text colors. The same file uses `--radius-full` for pill-like labels; the token is circular (`50%`), so those elements should use a pill radius.

3. **Local intake decodes every selected file concurrently.** `file-intake.tsx` uses `Promise.all` for preview preparation before the bounded compression queue begins. Large selections can therefore decode too many images at once and cause memory pressure or tab failure. Add explicit file/count/pixel limits and a bounded intake queue.

4. **The direct browser URL path does not enforce a streaming byte budget.** `fetch-image-url.ts` checks `Content-Length` but then calls `response.blob()`, which can consume an oversized chunked or inaccurate response before validation. Add an `AbortController`, a streamed reader with a hard byte cap, and visible cancellation/error states.

5. **Rate-limit identity is spoofable and process-local.** `requestClientKey` prefers a client-supplied `x-forwarded-for`, and the in-memory limiter will not coordinate across server instances. Add trusted-proxy handling, a deployment-appropriate shared limiter or documented single-instance constraint, and byte-volume limits for public proxy usage. Cap request body size before parsing JSON as well.

6. **Static animation rejection is heuristic.** The validator searches limited byte ranges for markers such as `ANIM` and `ANMF`. Parse the relevant container structure so animated WebP/AVIF/GIF inputs cannot evade the static-only contract through large metadata or unusual chunk ordering.

7. **Unprotected storage access can crash restricted browsers.** Settings persistence calls `localStorage` directly. Catch security/quota failures and fall back to defaults without taking down the tool.

8. **The service worker is keyed to the homepage.** Navigation responses are cached under `/` and offline navigation falls back to `/`. This is acceptable for the current one-page shape but will make future SEO routes overwrite or resolve to the homepage unless the cache strategy becomes route-aware.

### P2: quality and maintainability improvements

1. Add cancellation and stale-request guards to website scans and image preparation.
2. Make the dropzone keyboard-operable and associate resize/settings errors with their controls through `aria-describedby`; preserve clear live progress announcements.
3. Benchmark ZIP generation and move it to a worker if large bundles visibly block the main thread.
4. Split the 1,867-line `file-intake.tsx` into intake, settings, queue/progress, result, and download concerns without moving codec internals into React.
5. Add exact CSS-rendered-size reporting only if the product scope expands beyond the current honest intrinsic-dimension scan.
6. Add competitor comparison pages, editorial clusters, and backlink/distribution work only after capability and privacy claims are verified from current primary sources.

## Implementation plan

### Phase 0: establish the release baseline

Create one source of truth for launch scope and route inventory. Reconcile the stale “phases 1-31” header in `docs/14-implementation-roadmap-36-phases.md` with the 36-phase status document. Track each requirement as `implemented`, `needs verification`, `needs hardening`, or `not in scope`.

Deliverables:

- This audit and plan as the current backlog.
- A checked route/preset registry for every page intended to index.
- A release checklist that explicitly separates deferred tests from final release gates.

### Phase 1: close core correctness and safety gaps

Implement the P1 items before expanding the public page surface:

- Define all missing semantic design tokens and replace circular radii with pill radii where appropriate.
- Support every intended static input/output pair, especially AVIF to WebP, or make unsupported combinations impossible to select.
- Replace animation-marker heuristics with format-aware static-container validation.
- Add local intake limits and bounded preview preparation; retain the existing bounded worker compression queue.
- Stream direct URL responses with a hard byte cap, timeout, abort support, and signature/content-type validation.
- Wrap settings storage reads/writes so privacy mode, disabled storage, and quota errors degrade safely.
- Add request body limits, trusted client identity handling, shared-limiter readiness, and proxy egress-volume accounting.
- Add scan cancellation/stale-result protection and complete the error association/accessibility fixes.

Acceptance gate: every supported static input/output pair has a defined result or a clear disabled state; large local selections remain responsive; unsafe or oversized URL requests fail with structured errors; restricted storage does not crash the app; and all user-visible error states are associated with their controls.

### Phase 2: build the shared SEO/tool-page architecture

Add a server-rendered route registry and a reusable tool-page shell. Each registry entry should define the page title, H1, metadata, canonical path, preset, supported formats, intent copy, FAQ, related links, and schema facts. The client tool should receive a declarative preset rather than duplicating compression logic.

Required foundations:

- Absolute canonical metadata derived from `NEXT_PUBLIC_SITE_URL` in production.
- `sitemap.xml` and `robots.txt` generated from the registry.
- Truthful JSON-LD for the software/tool, breadcrumbs, and FAQs where applicable.
- Page-specific Open Graph/Twitter metadata.
- Internal links between related tool pages and back to the main compressor.
- No generic slug pages without unique intent, copy, configuration, and useful examples.

Acceptance gate: a fresh route renders useful HTML without JavaScript, has one meaningful H1, unique metadata/canonical, a working preset, valid links, and no accidental indexing of development pages.

### Phase 3: complete the homepage information architecture

Keep the compressor above the fold, then add the sections specified by `docs/02-information-architecture.md`: privacy/trust, quick controls, benefits, URL differentiation, target-size and conversion explanations, scanner showcase, popular tools, learning content, FAQ, and a real footer. Use the existing custom media where it helps, keep decorative media non-blocking, and make the header/footer links point to actual routes or sections.

Acceptance gate: desktop and mobile layouts are coherent, navigation targets resolve, keyboard focus and reduced-motion behavior remain correct, and the page communicates the URL/scanner differentiation without competing with the working tool.

### Phase 4: roll out SEO pages in focused batches

Ship pages only when each has a meaningful configuration and distinct intent.

Batch A: core compression and format pages:

- `/compress-image`
- `/compress-jpg`
- `/compress-png`
- `/compress-webp`
- `/resize-image`
- `/image-converter`
- the highest-value format conversion pages from the strategy document

Batch B: size and direct-URL pages:

- `/compress-image-to-100kb`
- `/compress-image-to-200kb`
- `/compress-image-to-500kb`
- `/compress-image-to-1mb`
- `/compress-image-from-url`
- `/compress-by-url`
- `/image-url-compressor`
- `/optimize-image-from-url`

Batch C: website optimization pages:

- `/website-image-optimizer`
- `/website-image-scanner`
- `/download-images-from-url`
- `/download-all-images-from-webpage`
- `/optimize-images-from-webpage`

For every page, include server-rendered intent copy, a real preset, privacy behavior, supported inputs/outputs, limits, examples/use cases, FAQ, related tools, and internal links. Reconsider or merge pages that would otherwise be near-duplicates.

### Phase 5: release hardening and measurement

Before production release:

- Make service-worker caching route-aware and verify offline behavior for the homepage and tool routes.
- Add CI checks for typecheck, lint, formatting, and the final production build.
- Run the deferred security, codec-matrix, URL-limit, accessibility, and end-to-end smoke checks.
- Validate production `NEXT_PUBLIC_SITE_URL`, outbound DNS/IP controls, redirect limits, timeouts, byte budgets, rate limiting, and redacted logs.
- Check Core Web Vitals, bundle/codecs loading, worker concurrency, object URL cleanup, and large-batch behavior.
- Connect privacy-conscious analytics and Search Console only after the measurement plan is defined.
- Crawl the deployed site for status codes, canonical consistency, sitemap coverage, schema validity, and accidental noindex/indexing issues.

The full build and automated suites belong here, at the final release gate, in line with the repository instructions.

## Recommended execution order

`Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4A → Phase 4B → Phase 4C → Phase 5`

Do not start competitor pages, a full crawler, accounts, cloud storage, animated-format support, or general image-editing features during this sequence. They are explicitly outside the current scope and would dilute the core URL-optimization promise.

## Definition of launch-ready

- Core static compression and conversion works locally for all promised format pairs.
- Local bytes never leave the browser; URL/server activity is limited to documented scan/proxy needs.
- Batch, target-size, resize, compare, naming, ZIP, cancellation, errors, and persistence behave safely on desktop and mobile.
- Scanner/proxy endpoints enforce HTTP(S), DNS/IP, redirect, MIME, timeout, body, byte, and rate limits.
- Homepage and every indexable tool route has unique SSR content, metadata, canonical, schema where appropriate, and working internal links.
- No undefined design tokens, dead primary navigation targets, or unassociated form errors remain.
- Final typecheck, lint, formatting, production build, security checks, accessibility checks, performance checks, and browser smoke pass are recorded.

