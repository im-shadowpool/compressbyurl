# 03 — Technical Architecture

## High level

```text
Next.js App
  ├─ server-rendered SEO/marketing content
  ├─ React tool UI
  ├─ browser compression workers
  └─ secure URL scanner API
```

## Browser pipeline

```text
File/remote bytes
→ validate
→ decode
→ normalize orientation
→ resize
→ transparency/background handling
→ encode
→ verify
→ Blob + metrics
→ preview/download/ZIP
```

## Suggested source layout

```text
src/
  app/
    (marketing)/
    (tools)/
    api/
  components/
    ui/
    compressor/
    scanner/
    marketing/
  features/
    file-intake/
    compression/
    resize/
    conversion/
    target-size/
    naming/
    batch/
    metadata/
    compare/
    image-url/
    website-scan/
    seo-presets/
  codecs/
  workers/
  lib/
    files/
    browser/
    zip/
    urls/
    security/
    seo/
    analytics/
  types/
```

## Encoder abstraction

```ts
type OutputFormat = "jpeg" | "png" | "webp" | "avif";

interface Encoder {
  supports(format: OutputFormat): boolean;
  encode(input: DecodedImage, options: EncodeOptions): Promise<Blob>;
}
```

React components must not know which concrete codec implementation is used.

## Worker responsibilities

Main thread:
- UI
- settings
- queue state
- preview
- download

Worker:
- decode
- orientation normalize
- resize
- encode
- target-size iterations

Concurrency must be adaptive and capped. Large images may force concurrency 1–2.

## Scanner

Keep scanner isolated so it can move to a dedicated service later.

Responsibilities:
- URL validation
- DNS/IP validation
- HTML fetch
- redirect validation
- image candidate extraction
- byte/time budgets
- safe proxy fallback
- structured errors

## Storage

No database is required for the core MVP. Add persistence only when a real feature requires it.
