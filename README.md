# CompressByURL

CompressByURL is a browser-first image optimization product with three entry modes:

1. **Upload Files** — compress locally in the browser.
2. **Image URL** — fetch a public image safely, then optimize locally.
3. **Website URL** — discover heavy webpage images, optimize selected assets locally, and download replacements.

## Positioning

**Compress images from files or URLs.**

Secondary positioning:

**Paste a URL. Find heavy images. Download lighter replacements.**

## Product principles

- User-uploaded files stay on the user's device.
- CPU-heavy image work runs in Web Workers/WASM, not on the server.
- URL/page modes use only a small secure fetch/scanner layer when browser CORS makes it necessary.
- URL workflows are the main differentiator from generic image compressors.
- SEO is a first-class product surface, but SEO pages must map to real working tool states.
- The project is built phase-by-phase; agents must not jump ahead.

## Explicit non-goals

- Animated GIF optimization
- Animated WebP optimization
- Animated AVIF optimization
- Accounts/database at launch
- Cloud image storage
- Generic server-side image compression
- Open proxy behavior
- Full-domain crawling
- Headless-browser scanning at launch
- Chrome extension at launch

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Optional production measurement variables are
documented in `.env.example` and remain disabled by default.

Lightweight repository verification:

```bash
npm run verify
```

After deploying, verify the live crawl surface from a machine with public network
access:

```bash
npm run verify:seo:production -- https://your-production-domain.example
```

Add `--require-ga` after consent and the GA4 web stream are intentionally enabled.
The live verifier checks sitemap pages, metadata uniqueness, canonicals, robots,
route-specific schema, consolidation redirects, and 404/noindex behavior.

## Deploy to Vercel

Import the Git repository as a new Vercel project and use these settings:

- Framework preset: `Next.js`
- Root directory: repository root (`./`)
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: leave unset so Vercel uses the Next.js build output
- Node.js version: `24.x`

Add `NEXT_PUBLIC_SITE_URL=https://compressbyurl.com` and the existing
`NEXT_PUBLIC_GA_MEASUREMENT_ID` to the Production environment. Do not copy the
local `.env` file into Git.

Add `compressbyurl.com` under Project Settings → Domains, then copy the exact DNS
record Vercel shows into the domain's current DNS provider. Keep the existing
Google Search Console verification TXT record. Configure `www.compressbyurl.com`
as a redirect to the apex domain so every indexable page continues to use the
canonical origin in `NEXT_PUBLIC_SITE_URL`.

No `vercel.json` or custom output-directory setting is needed. This must remain a
normal Next.js deployment because `/api/image-proxy` and `/api/website-scan` run as
server functions; do not configure a static export.

## Architecture at a glance

- Next.js App Router renders indexable page content and metadata on the server.
- React client components own the interactive file, image-URL and webpage-URL modes.
- Dedicated Web Workers perform compression with workload-aware concurrency.
- AVIF, lossless PNG optimization and ZIP code are loaded only when requested.
- The small server surface exists only for SSRF-safe public URL/page fetching and
  never receives files selected from the user's device.

## Current implementation status

All 36 phases of the production roadmap are complete. See
`docs/21-implementation-status.md` for the implementation and release-verification record.

SEO implementation is tracked separately in `docs/23-seo-progress.md`. Production
Search Console/analytics work remains gated on the final domain and account-owned
configuration.

## Read first

1. `AGENTS.md`
2. `START-HERE-CODEX.md`
3. `design.md`
4. `docs/00-product-vision.md`
5. `docs/01-product-requirements.md`
6. `docs/03-technical-architecture.md`
7. `docs/06-ui-design-system.md`
8. `docs/07-seo-master-strategy.md`
9. `docs/08-security-privacy.md`
10. `docs/14-implementation-roadmap-36-phases.md`
11. `docs/21-implementation-status.md`
12. `docs/17-seo-implementation-roadmap.md`
13. `docs/23-seo-progress.md`
14. `docs/25-backlink-distribution-plan.md`
