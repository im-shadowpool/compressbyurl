# 10 — Observability & Analytics

## Product events

- tool_opened
- files_added
- compression_started
- compression_succeeded
- compression_failed
- format_converted
- resize_used
- target_size_used
- batch_zip_downloaded
- image_url_submitted
- image_url_succeeded
- website_scan_started
- website_scan_succeeded
- website_scan_failed
- scan_optimization_started
- replacement_zip_downloaded
- preset_selected

## Safe properties

- route
- mode
- output format
- size bucket
- batch-size bucket
- saved-percent bucket
- error code
- browser capability flags

## Never send

- filenames
- image bytes
- EXIF
- page HTML
- sensitive full URLs/query strings

## Server metrics

- scan requests
- success rate
- unsafe URL blocks
- fetched/proxied bytes
- timeout rate
- rate-limit rate
- candidate image count
- response latency
