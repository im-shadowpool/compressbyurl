# 15 — Definition of Done

A production feature is done only when all relevant checks are satisfied.

## Product
- user-visible goal achieved
- active phase scope respected
- happy path and edge states handled

## UI
- desktop/mobile
- loading/empty/error/success
- keyboard/focus
- reduced motion where relevant

## Engineering
- strict types
- no unnecessary duplication
- no leaked Object URLs
- no main-thread batch compression
- codecs isolated
- scanner isolated

## Verification (Token-Efficient)
- clean code self-check
- syntax and type consistency verified
- automated tests (unit/integration/E2E) are deferred and created/run only when explicitly requested by the user

## Security
For URL/network features: SSRF, redirects, byte limits, timeout, rate limiting, redaction.

## Privacy
- local upload remains local
- no image bytes or filenames in analytics

## SEO
For indexable routes: unique title/H1/canonical, real tool behavior, useful copy, internal links.

## Release (Final Pre-Deployment Milestone)
- full production build (`npm run build`) is required only at final release/deployment, not during routine development phases
- formal reviewer audit on-demand when explicitly requested
