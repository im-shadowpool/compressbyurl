# CompressByURL — Codex Project Starter

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

## Current implementation status

All 36 phases of the production roadmap are complete. See
`docs/21-implementation-status.md` for the implementation and release-verification record.

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
