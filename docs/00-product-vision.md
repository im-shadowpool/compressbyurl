# 00 — Product Vision

## Brand

**CompressByURL**

## Main positioning

**Compress images from files or URLs.**

## Differentiator

Most image compressors begin with uploaded files. CompressByURL should support three entry modes:

- Upload Files
- Image URL
- Website URL

The strongest product story is:

> Paste a webpage URL, discover the images making it heavy, optimize selected assets, and download lighter replacements.

## Target users

Primary:
- frontend developers
- WordPress developers
- freelancers and agencies
- designers handing assets to developers
- ecommerce/content teams
- marketers maintaining landing pages

Secondary:
- students
- creators
- users who need files under a specific KB/MB limit

## Core jobs

### Local compression
Make one or many images smaller without obvious quality loss.

### Target size
Make an image less than 100 KB / 200 KB / 500 KB / custom size.

### Conversion
Convert static JPG/PNG/WebP/AVIF quickly.

### Batch
Apply one rule set to many files and download them together.

### Direct URL
Optimize a remote image from its public URL without the manual download/re-upload loop.

### Website scan
Find heavy images on a webpage, select them, optimize them, and download replacements.

## Portfolio value

The project should demonstrate:
- frontend architecture
- Web Workers
- browser image APIs
- WASM codecs
- performance/memory management
- SSRF-safe backend design
- product UX
- technical SEO
- declarative tool routes
- privacy-aware analytics

## Launch success

A stranger should be able to upload files, compress locally, convert, resize, hit a target size, batch download, paste an image URL, scan a webpage, identify heavy images, and download optimized replacements without documentation.

## Tone

Friendly, short, and useful.

Good:
- “Drop your images here.”
- “Paste an image URL.”
- “Scan this page.”
- “82% lighter.”
- “These files stay on your device.”
- “Fix the heavy ones.”

Avoid fake AI claims and codec jargon in the default UI.
