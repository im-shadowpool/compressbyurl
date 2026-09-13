# 08 — Security & Privacy

## Local uploads

Local image bytes must remain local.

Never send local image bytes, previews, filenames, EXIF, or GPS to the server/analytics by default.

## URL scanner threat model

Main risks:
- SSRF
- open proxy abuse
- internal/cloud metadata access
- redirect bypass
- DNS rebinding
- huge egress
- infinite/chunked bodies
- MIME spoofing
- credential forwarding

## URL validation pipeline

1. parse with a standard URL parser
2. require HTTP/HTTPS
3. reject embedded credentials if unsupported
4. resolve hostname
5. validate every resolved IP
6. reject loopback/private/link-local/reserved/metadata ranges
7. fetch with strict timeout
8. validate every redirect target
9. resolve and validate redirect host again
10. cap redirects
11. cap bytes while streaming
12. validate content type
13. return only required metadata/bytes

## Reject schemes/targets

- localhost/private/local networks
- metadata endpoints
- file://
- ftp://
- data:
- blob:
- custom schemes

Cover IPv4, IPv6, and IPv4-mapped IPv6 correctly.

## Proxy rules

Never expose an unrestricted endpoint like:
`/proxy?url=https://anything`

Prefer scanner-issued short-lived identifiers, or repeat full validation on every proxy request.

Never forward:
- cookies
- Authorization
- browser session headers

## HTML parsing

- parse as data
- execute no scripts
- no eval
- do not inject fetched markup directly into the DOM
- sanitize title/text before display

## Rate limiting

Separate limits for:
- scan requests
- metadata/image fetches
- proxy bytes

Track request count, byte volume, timeouts, and blocked unsafe destinations.

## Download filenames

Sanitize:
- path separators
- `..`
- controls
- extreme length
- reserved platform names when practical

## Privacy-safe analytics

Allowed examples:
- route
- mode
- output format
- coarse size bucket
- batch bucket
- savings bucket
- error code

Avoid filenames, image bytes, EXIF, page HTML, or full sensitive URL query strings.
