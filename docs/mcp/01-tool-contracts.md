# MCP Tool Contracts

Status: normative Phase 0 contract

Schema version: 1

## Contract rules

- Input objects are strict: unknown properties are rejected.
- Limits supplied by callers may reduce server limits, never raise them.
- Successful calls return text content plus matching structuredContent.
- Canonical sizes are non-negative integer bytes.
- Percentages are numbers from 0 through 100.
- URLs contain no fragments or embedded credentials.
- Local paths in results are normalized workspace-relative paths.
- Nullable means the fact could not be measured; zero never means unknown.
- Warnings are objects with stable code and safe message strings.
- Tool failures use isError with a stable code and do not return stack traces.

## Shared result fields

Every successful structured result contains:

| Field         | Type          | Meaning                  |
| ------------- | ------------- | ------------------------ |
| schemaVersion | literal "1"   | Result contract revision |
| warnings      | warning array | Non-fatal limitations    |

A warning contains code and message strings, plus an optional itemId.

## get_server_info

Phase: 1

Input: strict empty object.

Output:

| Field                      | Type                           |
| -------------------------- | ------------------------------ |
| schemaVersion              | literal "1"                    |
| name                       | literal "compressbyurl-mcp"    |
| version                    | semantic-version string        |
| transport                  | literal "stdio"                |
| runtime.node               | string                         |
| capabilities.tools         | string array                   |
| capabilities.formats       | array of jpeg, png, webp, avif |
| security.publicNetworkOnly | boolean                        |
| security.overwriteEnabled  | literal false                  |
| security.workspaceRootIds  | opaque string array            |
| warnings                   | warning array                  |

Annotations: readOnly true, destructive false, idempotent true, openWorld false.

## audit_webpage_images

Phase: 3

Input:

| Field     | Type    | Rules                                         |
| --------- | ------- | --------------------------------------------- |
| url       | string  | Required; HTTP/HTTPS; maximum 4096 characters |
| maxImages | integer | Optional; 1-80; default 20                    |

Output:

| Field                         | Type                |
| ----------------------------- | ------------------- |
| schemaVersion                 | literal "1"         |
| page.requestedUrl             | string              |
| page.finalUrl                 | string              |
| page.title                    | string or null      |
| summary.totalFound            | integer             |
| summary.reportedCount         | integer             |
| summary.measuredCount         | integer             |
| summary.failedCount           | integer             |
| summary.knownBytes            | integer             |
| summary.potentialSavingsBytes | integer or null     |
| images                        | webpage image array |
| limits.maxImages              | integer             |
| limits.truncated              | boolean             |
| limits.concurrency            | integer             |
| limits.pageMaxBytes           | integer             |
| limits.imageMaxBytes          | integer             |
| limits.totalImageMaxBytes     | integer             |
| limits.decodedPixelLimit      | integer             |
| limits.operationTimeoutMs     | integer             |
| warnings                      | warning array       |

Each webpage image contains:

- id: deterministic string
- requestedUrl and finalUrl (finalUrl may be null)
- sources: unique array of image, lazy-image, srcset, picture, metadata, preload
- alt, declaredWidth, declaredHeight: nullable source facts
- bytes, width, height, contentType, format: nullable measured facts
- status: measured or unavailable
- issues: stable issue-code array
- recommendation: action, reasonCodes, proposedFormat, and targetBytes; nullable when
  insufficient evidence exists
- error: stable code/message or null

Annotations: readOnly true, destructive false, idempotent true, openWorld true.

## audit_workspace_images

Phase: 4

Input:

| Field     | Type    | Rules                                                                                            |
| --------- | ------- | ------------------------------------------------------------------------------------------------ |
| rootId    | string  | Optional opaque configured-root selector; required when more than one approved root is available |
| directory | string  | Optional workspace-relative path; default "."                                                    |
| maxFiles  | integer | Optional; 1-1000; default 200                                                                    |

Output:

| Field                      | Type                                       |
| -------------------------- | ------------------------------------------ |
| schemaVersion              | literal "1"                                |
| rootId                     | opaque string                              |
| directory                  | workspace-relative string                  |
| summary.filesFound         | integer                                    |
| summary.filesReported      | integer                                    |
| summary.supportedBytes     | integer                                    |
| summary.duplicateBytes     | integer                                    |
| images                     | workspace image array                      |
| plan                       | optimization plan                          |
| limits.maxFiles            | integer                                    |
| limits.truncated           | boolean                                    |
| limits.maxDepth            | integer                                    |
| limits.maxFileBytes        | integer                                    |
| limits.totalSourceMaxBytes | integer                                    |
| limits.decodedPixelLimit   | integer                                    |
| limits.concurrency         | integer                                    |
| limits.maxSkippedReported  | integer                                    |
| skipped                    | structured workspace-relative skip records |
| warnings                   | warning array                              |

Each workspace image contains id, relativePath, bytes, width, height, format, content
type, SHA-256, duplicateOf (nullable), issues, and a proposed optimization (nullable).

The server must be started with one or more human-approved `--workspace-root` paths.
That server configuration is the filesystem authorization boundary. If the host
advertises MCP file roots, the tool additionally narrows access to their real-path
intersection. `get_server_info.security.workspaceRootIds` exposes opaque selectors,
never absolute configured paths.

Annotations: readOnly true, destructive false, idempotent true, openWorld false.

## optimize_image

Phase: 5

Input is a strict object:

| Field          | Type                  | Rules                                            |
| -------------- | --------------------- | ------------------------------------------------ |
| source         | discriminated union   | Exactly one URL or workspace-relative path       |
| rootId         | string                | Optional opaque configured-root selector         |
| destination    | string                | Required new workspace-relative file path        |
| format         | jpeg, png, webp, avif | Required                                         |
| mode           | quality or target     | Required                                         |
| quality        | integer               | Required in quality mode; 1-100                  |
| targetBytes    | integer               | Required in target mode; positive; server-capped |
| smartFit       | boolean               | Optional; default false                          |
| maxWidth       | integer               | Optional positive dimension                      |
| maxHeight      | integer               | Optional positive dimension                      |
| jpegBackground | hex color             | Required only when alpha is converted to JPEG    |

Metadata is always stripped in 0.1.0. Upscaling is never allowed. The destination must
not exist.

Output:

| Field                                      | Type                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| schemaVersion                              | literal "1"                                                                                               |
| source.type                                | url or workspace                                                                                          |
| source.identifier                          | sanitized URL or workspace-relative path                                                                  |
| original.bytes/width/height/format/sha256  | measured facts                                                                                            |
| optimized.bytes/width/height/format/sha256 | measured facts                                                                                            |
| optimized.quality                          | integer or null                                                                                           |
| target.requestedBytes                      | integer or null                                                                                           |
| target.met                                 | boolean or null                                                                                           |
| savedBytes                                 | integer                                                                                                   |
| savingsPercent                             | number                                                                                                    |
| destination                                | workspace-relative path                                                                                   |
| encoder.name/version                       | strings                                                                                                   |
| settings                                   | applied smart-fit, dimensions, background, metadata/orientation, attempt ceiling, and quality-floor facts |
| warnings                                   | warning array                                                                                             |

Annotations: readOnly false, destructive false, idempotent false, openWorld true because
the same tool may fetch a URL. Existing destinations are never modified.

The encoder verifies the output signature and dimensions before committing. It writes a
same-directory temporary file, syncs it, then uses an exclusive atomic hard-link commit
so a concurrent destination cannot be replaced. The temporary name is removed after
success or failure.

## Optimization plan

Phase: 6

An optimization plan contains:

- schemaVersion: literal "1"
- planId: deterministic digest of canonical plan content
- rootId: opaque workspace root identifier
- createdFrom: literal `workspace` in schema version 1
- items: ordered plan-item array

Each item contains an ID, workspace source identifier and SHA-256, new destination,
format, target byte mode, smart-fit flag, and audit reason codes. Plans contain at most
1,000 items. `planId` is recomputed from the ordered root/item content before any
directory is created.

## apply_image_optimization_plan

Phase: 6

Input contains a complete optimization plan and a new workspace-relative
`outputDirectory`. Every proposed destination must be a direct child of that exact
directory. The directory and its parents must pass root-containment and no-symlink
checks, and the directory must not already exist.

Output contains the schema, plan and root IDs; the output directory; requested,
succeeded, failed, and cancelled counts; byte totals; ordered per-item outcomes; batch
limits; warnings; and the workspace-relative manifest path. Successful item outcomes
embed the verified single-image optimization result. Failed/cancelled outcomes contain
only a stable error code and safe message.

The tool revalidates every item, source hash, and destination. It never trusts a plan
merely because it has a matching shape. Work is limited to two encoders at a time.
Failures do not roll back unrelated committed outputs. The same output object is
written with an exclusive atomic commit to `replacement-manifest.json`, so the
manifest records every successful, failed, and cancelled outcome in plan order.

Annotations: readOnly false, destructive false, idempotent false, openWorld false.
Schema version 1 plans contain workspace sources only. Reapplying a plan cannot reuse
or overwrite its output directory.

## .compressbyurlrc.json and check CLI

Phase: 7

The strict version 1 policy contains global `maxBytes`, `maxWidth`, and `maxHeight`
budgets plus up to 100 ordered path rules using relative `*`, `?`, and whole-segment
`**` globs. Every budget object must declare at least one limit. Matching rules override
only their declared fields, with later rules taking precedence.

`compressbyurl-mcp check` runs the same workspace audit implementation as
`audit_workspace_images`, evaluates the policy without network access or writes, and
supports human-readable or compact JSON output. JSON includes the exact MCP audit and
ordered policy findings without raw image content or private absolute paths.

Stable exits are 0 for pass, 1 for completed audit with budget failures, and 2 for
invalid arguments/policy or incomplete execution.

## Stable error families

- INVALID_INPUT
- INVALID_PLAN
- INVALID_URL
- UNSAFE_DESTINATION
- DNS_FAILED
- TIMEOUT
- TOO_MANY_REDIRECTS
- RESPONSE_TOO_LARGE
- UNSUPPORTED_CONTENT_TYPE
- SIGNATURE_MISMATCH
- UNSUPPORTED_FORMAT
- ANIMATED_IMAGE
- FETCH_FAILED
- UPSTREAM_ERROR
- DECODE_FAILED
- PIXEL_LIMIT_EXCEEDED
- OPERATION_BYTE_LIMIT
- WORKSPACE_ROOT_REQUIRED
- PATH_OUTSIDE_ROOT
- PATH_ESCAPE
- FILE_NOT_FOUND
- DESTINATION_EXISTS
- JPEG_BACKGROUND_REQUIRED
- TARGET_UNREACHABLE
- ENCODE_FAILED
- WRITE_FAILED
- SOURCE_CHANGED
- CANCELLED
- INTERNAL_ERROR

Specific phases may add codes, but must not change the meaning of an existing code
within schema version 1.
