# 04 — Compression Engine

## Pipeline

`input → validate → decode → orientation → resize → transparency policy → encode → verify → result`

## Smart defaults

- never upscale
- preserve aspect ratio
- strip metadata by default
- preserve alpha when needed
- avoid PNG for photographic output unless explicitly requested
- lazy-load expensive codecs

## Target-size search

For lossy formats:
1. encode high quality
2. if already <= target, return
3. test configured lower bound
4. if still too large, either reduce dimensions in Smart target mode or return TARGET_UNREACHABLE
5. binary-search quality
6. keep highest-quality valid result <= target
7. stop after bounded iterations

## Memory rules

- release decoded bitmap
- revoke object URLs
- avoid duplicate full-resolution buffers
- decode queued images incrementally
- detect huge pixel counts
- fail gracefully under memory pressure

## Result model

Include:
- Blob
- output name/MIME
- original/output bytes
- original/output dimensions
- saved bytes/%
- metadata state
- warnings
