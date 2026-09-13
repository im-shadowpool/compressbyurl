# 14 — Implementation Roadmap: 36 Production Phases

Each phase is deliberately small. Finish and review one phase before moving to the next.

> **Current status (2026-09-13):** Phases 1 through 31 are complete. Work is stopped
> before Phase 32. See [21 - Implementation Status](./21-implementation-status.md)
> for verified progress and pending phases.

## Global completion rule & token efficiency

Every phase must include the relevant production implementation, loading/empty/error/success states, mobile behavior, and accessibility. Do not partially implement later phases unless strictly required as infrastructure.

**Token & Agent Cost Reduction Rules:**
- **Skip automated test writing & execution**: Do not create or run test suites during feature development.
- **Skip full production builds (`npm run build`)**: Skip heavy build bundling during regular phases; full builds are reserved strictly for Phase 36 (pre-deployment release).
- **Skip reviewer loops**: Self-verify code cleanly during implementation; do not spawn separate reviewer or QA passes.

## Phase 1 — Foundation & Repository Setup

### Build
- Initialize Next.js App Router with strict TypeScript.
- Add linting, formatting, path aliases (testing runners optional/deferred).
- Create feature-oriented source architecture.
- Add scripts for typecheck and lint.
- Add metadata defaults and global error boundary.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 2 — Design Tokens & Global Theme

### Build
- Implement color, spacing, radius, typography and elevation tokens.
- Integrate Material Symbols.
- Create responsive container/grid primitives.
- Add reduced-motion utilities.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 3 — Core UI Primitives

### Build
- Build Button, IconButton, Input, Select, Slider, SegmentedControl, Card, Dialog, Sheet and Toast.
- Add keyboard/focus/accessibility states.
- Create visual regression baseline.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 4 — Marketing Shell & Navigation

### Build
- Build header, footer and responsive navigation.
- Add hero shell and top-level mode switch.
- Keep the functional tool above the fold.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 5 — Media Registry & Public Media Integration

### Build
- Inspect /public/media.
- Create centralized asset registry.
- Build responsive MediaFrame.
- Add hero image/video fallback strategy.
- Respect reduced motion.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 6 — File Intake Foundation

### Build
- Implement drag/drop and browse.
- Support multiple files.
- Define accepted static formats.
- Reject unsupported/corrupt items independently.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 7 — Preview Lifecycle & File Metadata

### Build
- Create Object URLs.
- Read dimensions safely.
- Show name/size/type/dimensions.
- Revoke URLs on removal/clear.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 8 — Compression Domain Types & Service Boundary

### Build
- Create CompressionSettings, CompressionResult and processing state types.
- Create stable compression service interface.
- Keep React independent from codec details.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 9 — Worker Client & Messaging Protocol

### Build
- Create worker client.
- Define request/response protocol.
- Handle worker error/cancel.
- Keep UI responsive.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 10 — JPEG Encode Path

### Build
- Decode JPEG.
- Normalize orientation.
- Encode at fixed quality.
- Download valid JPEG output.
- Add sample fixtures.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 11 — WebP Encode Path

### Build
- Add WebP encoder.
- Preserve alpha.
- Support JPEG/PNG/WebP input.
- Lazy-load codec if useful.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 12 — PNG Optimization Path

### Build
- Implement proper lossless PNG optimization.
- Avoid misleading JPEG-style quality behavior.
- Preserve transparency.
- Verify with screenshots and alpha PNGs.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 13 — Static AVIF Path

### Build
- Add static AVIF only.
- Lazy-load encoder.
- Handle unsupported capabilities.
- Measure CPU cost.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 14 — Resize Engine — Max Dimensions

### Build
- Implement max width/max height/max dimensions.
- Preserve aspect ratio.
- Prevent upscaling.
- Verify portrait and landscape orientations.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 15 — Resize Engine — Exact Dimensions

### Build
- Add exact dimensions.
- Define aspect-ratio behavior explicitly.
- Prevent silent distortion.
- Validate inputs.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 16 — Format Conversion UI

### Build
- Add Keep Original/JPEG/PNG/WebP/AVIF.
- Keep MIME and extension aligned.
- Warn on transparency → JPEG.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 17 — JPEG Background Handling

### Build
- Add background color control.
- Default transparent → white for JPEG.
- Preview expected appearance.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 18 — Quality Mode UI

### Build
- Add lossy quality control.
- Show current value.
- Map consistently to encoder.
- Hide misleading quality UI for PNG.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 19 — Smart Mode

### Build
- Define useful default decisions.
- Prevent upscaling.
- Preserve alpha when necessary.
- Strip metadata by default.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 20 — Target-Size Search Core

### Build
- Implement bounded binary search over quality.
- Keep highest-quality result <= target.
- Return TARGET_UNREACHABLE when constraints fail.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 21 — Target-Size Presets

### Build
- Add 100KB/200KB/500KB/1MB.
- Add custom KB/MB input.
- Clearly show successful under-target result.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 22 — Smart Target-Size Dimension Reduction

### Build
- Reduce dimensions only when quality alone cannot satisfy target.
- Preserve aspect ratio.
- Disclose dimension changes.
- Enforce sensible lower bounds.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 23 — Batch Queue & Adaptive Concurrency

### Build
- Bound worker concurrency.
- Reduce concurrency for huge images.
- Keep per-item state.
- Allow partial success.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 24 — Batch Summary

### Build
- Aggregate before/after bytes.
- Aggregate savings.
- Show success/error counts.
- Avoid excessive rerenders.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 25 — Naming — Prefix/Suffix/Case

### Build
- Add prefix/suffix.
- Add lower/upper/unchanged case.
- Sanitize filenames.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 26 — Naming — Pattern Tokens & Sequence

### Build
- Implement tokens.
- Sequence start and zero padding.
- Collision resolution.
- Deterministic output.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 27 — Individual & Bulk Downloads

### Build
- Single-file download.
- Download all successful items individually if requested.
- Safe names.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 28 — ZIP Download

### Build
- Generate ZIP in browser.
- Include successful items only.
- Prevent UI freeze.
- Test ZIP contents.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 29 — Metadata Controls

### Build
- Strip metadata by default.
- Preserve where supported.
- Normalize orientation first.
- Verify GPS behavior.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 30 — Before/After Compare

### Build
- Build comparison UI.
- Show dimensions/bytes/format.
- Handle large previews efficiently.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 31 — Preset System

### Build
- Add Website Hero, Blog Image, Thumbnail, Avatar, Email and target-size presets.
- Allow settings to be edited after preset selection.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 32 — Settings Persistence

### Build
- Persist safe preferences locally.
- Version settings schema.
- Handle migration/reset.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 33 — PWA & Offline Local Compression

### Build
- Add manifest and service worker.
- Cache app shell/codecs safely.
- Local compression works offline.
- URL modes explain internet requirement.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 34 — Direct Image URL Mode

### Build
- Add Image URL tab.
- Validate URL.
- Try direct CORS fetch.
- Use safe proxy fallback.
- Reuse local engine.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 35 — Website Scanner — Secure Backend

### Build
- Implement SSRF-safe scan endpoint.
- Validate DNS/IP/redirects.
- Cap bytes/time/count.
- Parse core image candidates.
- Rate limit.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Implementation is verified cleanly without heavy builds or automated test suites.

## Phase 36 — Website Audit & Replacement Workflow

### Build
- Render scan results.
- Add issue tags/recommendations.
- Select images.
- Optimize selected locally.
- Generate replacement-map.json and ZIP.

### Acceptance criteria
- The phase works independently and preserves all prior completed phases.
- No later-phase feature is casually pulled forward.
- Final launch verification and pre-deployment build pass.
