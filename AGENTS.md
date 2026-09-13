# AGENTS.md — CompressByURL

This file is the primary instruction contract for every agent working on CompressByURL.

## Mission

Build a production-grade browser-first image optimization platform with three modes:

- Upload Files
- Image URL
- Website URL

The product must work well as a normal compressor while being clearly differentiated by URL-based image optimization and webpage image auditing.

## Core promise

### Local uploads

Local file bytes must not be uploaded to the server. Decode, resize, compress, convert, target-size search, previews, naming, and ZIP generation belong in the browser.

### URL modes

A small server layer may safely fetch public HTTP/HTTPS resources when CORS prevents browser access. Compression should still occur locally after bytes reach the browser.

## Supported static formats

- JPEG/JPG
- PNG
- WebP
- static AVIF

Do not implement animated GIF/WebP/AVIF optimization.

## Preferred stack

Use current stable versions:

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- Material Symbols
- custom Material 3-inspired components
- Zod
- Web Workers
- WASM codecs where they materially help
- browser ZIP library such as JSZip
- Vitest/Jest (optional, deferred for on-demand test runs)
- Playwright (optional, deferred for on-demand test runs)
- ESLint + formatter

Only add Zustand/global state if local state is insufficient.

## Architecture boundaries

### Browser owns

- local files
- decoding
- EXIF orientation normalization
- resize
- compression/encoding
- static conversion
- target-size search
- batch queue
- naming
- compare
- ZIP
- settings persistence
- offline local tool

### Server owns only URL needs

- URL normalization/validation
- SSRF-safe DNS/IP checks
- HTML fetch
- redirect validation
- candidate image discovery
- safe image proxy fallback
- rate limiting
- byte/time budgets
- structured scan manifests/errors

Never move local upload compression server-side for convenience.

## Product differentiation

The product evolves from:

`Upload → Compress → Download`

to:

`Paste webpage URL → discover image problems → select → optimize locally → download replacement bundle`

Do not dilute this with unrelated image-editor features before core flows ship.

## SEO rules

SEO is a separate workstream. Read:

- `docs/07-seo-master-strategy.md`
- `docs/17-seo-implementation-roadmap.md`
- `docs/18-seo-page-specifications.md`
- `docs/19-seo-competitor-targeting.md`

Every indexable tool page must:

- use the shared real tool engine
- configure a meaningful preset/mode
- have unique title/H1/meta/canonical
- include useful server-rendered content
- avoid thin duplication
- avoid unverified competitor claims

## Security rules

URL fetching is SSRF-sensitive.

Required:

- HTTP/HTTPS only
- reject loopback/private/link-local/reserved/metadata targets
- validate DNS results
- revalidate every redirect
- limit redirect count
- enforce strict timeouts
- enforce byte limits while streaming
- allowlist expected content types
- do not forward cookies or Authorization
- do not create a generic open proxy
- rate-limit scan/proxy endpoints
- structured security error codes

See `docs/08-security-privacy.md`.

## Performance rules

- never batch-compress on the React main thread
- bounded worker concurrency
- reduce concurrency for huge images
- lazy-load heavy codecs, especially AVIF
- revoke object URLs
- avoid base64 for large binary data
- do not decode entire batches simultaneously
- server-render SEO copy
- decorative media must not block the tool

## UI direction & design.md

All agents must strictly refer to `design.md` in the project root for UI design specifications, styling, color tokens, typography, component geometry, and aesthetics.

Key directives from `design.md`:
- **Design System Source of Truth**: Follow the tokens and component specs in `design.md`.
- **Colors**: Deep violet ink (`#3c315b`), periwinkle lavender accent (`#ab9ff2`), near-black hero canvas (`#1c1c1c`), warm near-white surface (`#fffdf8`), and subtle hairline borders (`#e9e8ea`).
- **Typography**: Inter (or Plus Jakarta Sans) font for clean, highly legible typography with single/restrained weight discipline.
- **Components & Geometry**: Generous rounding (24px–32px cards, 100px pill buttons).
- **Uncluttered layout**: Progressive disclosure (neat toggles, settings dropdowns/drawers, and collapsed power-user controls).
- **Icons**: Material Symbols.
- **Media**: Custom generated 3D media from `public/media`.

## Media folder

Before adding placeholders or stock media, inspect:

`/public/media`

Suggested subfolders:

- hero
- compression
- conversion
- target-size
- batch
- url
- scanner
- privacy
- features
- videos
- posters
- backgrounds

For video: muted, playsInline, short loop, poster fallback, reduced-motion fallback, no autoplay audio.

## Coding rules

- avoid `any`
- use discriminated unions for processing states
- isolate codecs behind interfaces
- isolate worker protocol behind a service/client
- keep React free of codec internals
- keep scanner UI free of proxy/fetch internals
- pure functions for naming, sizing, presets, scoring
- declarative tool-route presets
- explicit error codes

## Phase discipline & token efficiency

Implement only the active phase.

To conserve agent usage, token quota, and runtime:
- **Skip automated tests**: Do not write unit/e2e test suites or run vitest/playwright during phases unless explicitly instructed by the user.
- **Skip separate reviewer loops**: Do not trigger separate reviewer/QA agent passes; self-verify code cleanly during implementation.
- **Skip full production build (`npm run build`)**: Do not run heavy bundling during regular feature phases. Full builds are reserved strictly for final pre-deployment release or diagnosing server/client bundling bugs. Target lightweight inspection instead.

A phase is done when:
- production feature behavior works and matches phase scope
- loading/empty/error/success states exist
- mobile & responsive considerations are handled
- accessibility is respected
- progress notes or docs are updated if required

## Explicit exclusions until scope changes

- animated formats
- accounts/auth
- database
- cloud storage
- Chrome extension
- full site crawler
- headless browser scanner
- AI background removal
- general-purpose image editor
