# 09 — Testing & Quality

> [!IMPORTANT]
> **TOKEN EFFICIENCY POLICY**:
> Automated tests and test suites are deferred by default to conserve agent usage and execution tokens. Agents should NOT implement or run test suites described in this document unless explicitly commanded by the user. This document serves as a quality specification and manual verification reference.

## Unit tests (Reference)

- filename/pattern logic
- byte formatting
- savings percentage
- resize math
- aspect ratio
- target-size search decisions
- preset config
- URL normalization
- safe filename
- scan issue scoring

## Codec integration fixtures

- photographic JPEG
- screenshot PNG
- transparent PNG
- static WebP
- static AVIF
- EXIF orientation
- GPS metadata
- very large image
- corrupt image

## API integration

- public URL validation
- redirect validation
- private IP rejection
- candidate parsing
- byte limits
- timeout
- proxy constraints
- structured errors

## Critical E2E flows

1. upload JPEG → compress → download
2. PNG alpha → WebP
3. target 200KB
4. batch → naming → ZIP
5. direct image URL
6. website scan
7. scan → select → optimize → replacement ZIP
8. mobile compressor
9. offline local compression

## Browser matrix

- Chrome
- Edge
- Firefox
- Safari

Use capability detection rather than silent breakage.

## Accessibility

- axe automation
- keyboard-only manual flow
- focus order
- screen-reader labels
- reduced motion
- contrast

## Performance

Measure:
- initial JS
- LCP
- INP
- memory during batch
- time to first completed item
- codec lazy-load cost
- scanner latency
- scanner egress
