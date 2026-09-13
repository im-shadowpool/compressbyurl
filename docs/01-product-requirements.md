# 01 — Product Requirements

## A. Upload files

Support:
- drag/drop
- browse
- multiple files
- JPG/JPEG
- PNG
- WebP
- static AVIF
- clipboard paste when supported
- remove item
- clear all
- thumbnail preview
- dimensions
- original size
- processing state

Do not optimize animated formats.

## B. Compression modes

### Smart
Use safe recommended defaults.

### Quality
User selects quality for lossy formats.

### Target Size
User enters KB/MB target and the engine finds the best result under it.

## C. Output formats

- Keep original
- JPEG
- PNG
- WebP
- AVIF

Rules:
- JPEG has no alpha
- preserve alpha in alpha-capable formats
- warn before transparency → JPEG
- static output only

## D. Resize

- original
- max width
- max height
- max dimensions
- exact dimensions
- maintain aspect ratio
- prevent upscaling
- show final dimensions before/after processing

## E. Target size

- custom numeric input
- KB/MB units
- 100 KB / 200 KB / 500 KB / 1 MB presets
- bounded quality search
- highest-quality result <= target
- optional dimension reduction only in Smart target mode
- explicit target-unreachable state

## F. Naming

- original name
- prefix
- suffix
- lowercase/uppercase/unchanged
- sequence
- zero padding
- custom pattern

Tokens:
- `{name}`
- `{ext}`
- `{format}`
- `{width}`
- `{height}`
- `{number}`
- `{page}`

## G. Batch

- bounded worker queue
- per-item status
- aggregate stats
- retry failed item
- partial-success downloads
- ZIP
- deterministic names

## H. Compare

Show:
- original/optimized preview
- dimensions
- bytes
- savings
- output format
- warnings

## I. Metadata

- strip by default
- preserve option where supported
- normalize EXIF orientation first
- GPS stripping
- documented color-profile behavior

## J. Offline/PWA

After first successful cache:
- local compression works offline
- URL modes clearly require internet

## K. Direct image URL

1. validate public URL
2. direct browser fetch if CORS allows
3. controlled server proxy fallback otherwise
4. local compression
5. normal result/download flow

## L. Website URL

Discover initially:
- img[src]
- img[srcset]
- picture/source
- common lazy attributes
- OG image
- Twitter image

No full-domain crawl at launch.

## M. Website audit

Show:
- source URL/path
- size
- dimensions
- format
- issue tags
- recommendation
- estimated savings
- selection state

Issue examples:
- large bytes
- oversized natural dimensions
- natural dimensions much larger than declared dimensions
- old/heavy format
- duplicate asset
- missing width/height
- already optimized

## N. Replacement bundle

ZIP may include:
- optimized images
- replacement-map.json
- optional CSV
- optional README

## O. SEO tool pages

Tool pages must be real presets of the shared production engine. Detailed SEO implementation is kept separately.
