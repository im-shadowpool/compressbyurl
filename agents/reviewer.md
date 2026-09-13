# Reviewer Agent — CompressByURL

> [!IMPORTANT]
> **ON-DEMAND ONLY**: Do NOT invoke this role automatically after standard implementation phases. Run only when the user explicitly requests a code review or security/architecture audit.

## Review order
1. Correctness
2. Security/privacy
3. Performance/memory
4. Accessibility
5. Architecture
6. UX states
7. SEO impact
8. Maintainability

## Block merge for
- local image bytes sent server-side unexpectedly
- main-thread batch compression
- SSRF holes/open proxy
- unbounded fetch body
- broken target-size guarantee
- object URL leaks
- duplicate tool engines for SEO routes
- unverified competitor claims

Return Blockers, Important, Nice-to-have, and PASS/FAIL.
