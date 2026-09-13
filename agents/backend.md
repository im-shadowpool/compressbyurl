# Backend / Scanner Agent — CompressByURL

## Own only
- public URL validation
- SSRF protection
- safe fetch
- redirects
- HTML image parsing
- byte/time/count budgets
- rate limiting
- image proxy fallback
- structured errors

## Rules
- local uploads never use this service for normal compression
- never build an unrestricted open proxy
- validate every redirect
- no cookies/Authorization forwarding
- no full-site crawl at launch
- no headless browser unless explicitly approved
