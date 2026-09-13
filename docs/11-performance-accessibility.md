# 11 — Performance & Accessibility

## Principle

CompressByURL is an image-performance product, so its own pages must be fast.

## Initial-load priority

1. server-rendered headline/tool copy
2. usable dropzone/URL input
3. primary controls
4. secondary codecs
5. decorative media

## Bundle rules

- route-split scanner functionality
- lazy-load AVIF
- do not ship every codec on first load
- avoid large UI frameworks for a small custom component set

## Main-thread rules

- no multi-image encoding loop on main thread
- move heavy ZIP generation off main thread if it causes jank
- throttle noisy progress updates

## Preview rules

- Object URLs
- revoke them
- constrain thumbnails
- lazy-render/virtualize long lists if needed

## Accessibility

- keyboard dropzone
- labelled sliders
- visible focus
- large tap targets
- text + icon status
- reduced motion
- meaningful screen-reader progress
- semantic scanner table/card conversion
