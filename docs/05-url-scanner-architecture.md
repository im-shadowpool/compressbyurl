# 05 — URL Scanner Architecture

## Direct image URL

`URL → validate → direct CORS fetch when possible → safe proxy fallback → local worker compression`

## Website URL

`Page URL → SSRF-safe scanner → HTML fetch → redirect validation → image extraction → dedupe/limits → manifest → selected bytes → local compression → replacement ZIP`

## Initial discovery sources

- img[src]
- img[srcset]
- picture source[srcset]
- data-src/data-srcset
- Open Graph image
- Twitter image

## Limits

Keep configuration-driven:
- redirect cap
- HTML body cap
- image candidate cap
- per-image cap
- total scan budget
- per-request timeout
- overall deadline
- rate limits

## Accuracy limitation

A lightweight HTML scanner does not know exact computed CSS render size. Only claim natural dimensions, declared dimensions, bytes, and heuristic oversizing unless a real browser-rendering context is later introduced.

## Future, not launch

- Chrome extension
- headless browser scanner
