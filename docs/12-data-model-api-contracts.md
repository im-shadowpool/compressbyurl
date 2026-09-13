# 12 — Data Models & API Contracts

## Compression settings

```ts
type CompressionMode = "smart" | "quality" | "target-size";
type OutputFormat = "keep" | "jpeg" | "png" | "webp" | "avif";

interface CompressionSettings {
  mode: CompressionMode;
  outputFormat: OutputFormat;
  quality?: number;
  targetBytes?: number;
  resize: {
    mode: "original" | "max" | "exact";
    width?: number;
    height?: number;
    maintainAspectRatio: boolean;
    preventUpscale: boolean;
  };
  naming: {
    mode: "original" | "pattern";
    prefix?: string;
    suffix?: string;
    pattern?: string;
    startNumber?: number;
    padding?: number;
  };
  stripMetadata: boolean;
  jpegBackground?: string;
}
```

## Scan request

`POST /api/scan`

```json
{ "url": "https://example.com/page" }
```

## Scan response shape

```json
{
  "scanId": "opaque-short-lived-id",
  "page": { "url": "https://example.com/page", "title": "Example" },
  "summary": { "imageCount": 20, "knownBytes": 12000000 },
  "images": []
}
```

## Proxy shape

Prefer:
`GET /api/scan/{scanId}/image/{imageId}`

Do not expose a generic arbitrary URL proxy.

## Error envelope

```json
{
  "error": {
    "code": "URL_PRIVATE_NETWORK",
    "message": "This URL points to a private or local network address."
  }
}
```

Never return production stack traces.
