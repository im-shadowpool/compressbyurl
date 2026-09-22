# 28 — MCP Server Implementation Plan

## Purpose

This is the source of truth for building the CompressByURL Model Context Protocol
server. The existing web product is production-ready; MCP is a separate workstream and
must not destabilize it.

## Product outcome

Build a local, independently installable MCP server that lets coding agents:

1. audit public webpages for heavy or poorly delivered images,
2. audit static images inside an approved workspace,
3. create optimized replacements under explicit byte budgets, and
4. produce a reproducible replacement manifest for human review.

The differentiating workflow is:

    audit -> evidence -> optimization plan -> safe replacements -> manifest

This is not a general image editor or an unrestricted file/network tool.

## Architecture decision

Build MCP in this Git repository as separate publishable packages:

    CompressByURL/
    |-- src/                         existing Next.js application
    |-- packages/
    |   |-- url-audit-core/          shared security, extraction and schemas
    |   |-- mcp/                     MCP server and Node image optimization
    |-- docs/
    |-- package.json

Keep the web app at the repository root. The shared core owns URL safety, inert HTML
extraction, schemas, recommendation rules, and stable errors. The MCP package owns
stdio, tools, workspace authorization, Sharp encoding, target-size search, atomic
writes, structured results, and npm packaging.

The web app keeps browser files, Workers/WASM, UI, previews, ZIP, and settings. MCP
must not import React, Next.js, browser workers, or browser codecs.

## Baseline decisions

- Node.js 22.19+; Node 24 is the primary release runtime.
- Strict TypeScript with no any.
- Current stable @modelcontextprotocol/server v2 and Zod 4.
- Local stdio transport only for the first release.
- Sharp is an external MCP runtime dependency.
- Publish through npm beginning at version 0.1.0.
- No telemetry by default.
- Initial tools create new files only and never overwrite sources.
- Public HTTP/HTTPS only by default.
- Localhost is enabled only by a human-controlled startup option.

The selected public package name is compressbyurl-mcp. The shared
@compressbyurl/url-audit-core workspace remains private and is bundled into MCP.

## Initial tools

- audit_webpage_images: read-only public webpage audit with measured evidence.
- audit_workspace_images: read-only audit beneath approved workspace roots.
- optimize_image: optimize one URL or local image into a new authorized destination.
- apply_image_optimization_plan: deferred batch application after single-file safety.

The webpage audit must not claim actual LCP without browser-rendered evidence.

## Standard results

Every tool defines Zod input and output schemas. Success returns concise text content
and matching structuredContent. Canonical sizes are integer bytes.

All results contain schemaVersion, source identifiers, applied limits, deterministic
summary fields, and warnings. Optimization results also contain original/output bytes,
dimensions and formats; actual quality/resize settings; targetBytes and targetMet;
savings; SHA-256 hashes; workspace-relative output path; and encoder version.

Errors use stable codes and safe messages. Never expose stack traces, credentials,
environment values, internal IP details, or unrestricted absolute paths.

## Phase execution rules

Only one phase is active at a time. Read AGENTS.md and this plan, implement only the
active phase, run all required verification, update status/evidence, and stop.

Security, contract, containment, and package tests required here are mandatory. They
are an explicit exception to the web roadmap's automated-test deferral. Full web builds
remain unnecessary unless Next.js bundling or deployment is affected.

## Status

| Phase | Name                               | Status                   |
| ----- | ---------------------------------- | ------------------------ |
| 0     | Decisions and repository readiness | Complete                 |
| 1     | Package and protocol foundation    | Complete                 |
| 2     | Shared URL audit core              | Complete                 |
| 3     | Public webpage audit tool          | Complete                 |
| 4     | Workspace image audit tool         | Complete                 |
| 5     | Safe single-image optimization     | Complete                 |
| 6     | Plans and batch application        | Complete                 |
| 7     | Policy file and CI command         | Complete                 |
| 8     | Packaging and public release       | In progress — release PR |

Overall roadmap completion: 8 of 9 phases (89%).

## Mandatory security invariants

### Network

- Validate every hostname and IP before connecting; pin the validated address.
- Reject loopback, private, link-local, reserved, metadata, and mapped IPv4 addresses.
- Revalidate every redirect and enforce redirect, time, byte, and pixel limits.
- Validate content type and binary signature.
- Never forward cookies, authorization, session, or proxy credentials.
- Never expose a generic proxy.

Localhost requires a human startup option such as --allow-loopback. It must not enable
private LAN or metadata ranges. Public-page candidates never inherit local access.

### Filesystem and process

- Treat trusted server-approved roots as the hard filesystem boundary; when a client
  supplies MCP roots, intersect them only as an additional narrowing constraint.
- Resolve paths and reject traversal, symlink, junction, device, and non-file inputs.
- Refuse existing destinations and commit new files by atomic rename.
- Bound depth, file count, bytes, pixels, and concurrency.
- Reserve stdout for MCP protocol; diagnostics use stderr.
- Treat all fetched text as untrusted data and never execute it.

## Phase 0 — Decisions and repository readiness

### Deliverables

- Confirm npm name/ownership and add an open-source license.
- Confirm Node versions and release operating systems.
- Choose trusted publishing or a narrowly scoped release token.
- Add npm workspaces without moving the web application.
- Add root scripts addressing each workspace.
- Confirm stdio as the only initial transport.
- Record initial input/output schemas as contracts.

### Acceptance criteria

- Fresh npm install resolves root and workspaces.
- Existing web development and Vercel configuration remain valid.
- Package identity, license, platforms, and release ownership are documented.

### Stop point

Do not scaffold MCP until these decisions are complete.

## Phase 1 — Package and protocol foundation

### Deliverables

- Create packages/mcp with package metadata and TypeScript configuration.
- Use McpServer, registerTool, and the v2 stdio entry point.
- Add a read-only get_server_info tool.
- Create a server factory usable without spawning a process.
- Add typed errors and a schema-version constant.
- Add build, typecheck, lint, test, pack, and Inspector scripts.
- Configure npm files, bin, engines, license, repository, and publish metadata.
- Preserve the executable shebang in built output.

### Verification and acceptance

- Typecheck/lint and connect through MCP Inspector.
- List and invoke get_server_info.
- Confirm stdout contains only protocol traffic.
- Pack and run the tarball outside the repository.
- Confirm the tarball excludes secrets, caches, fixtures, and web files.

### Stop point

Do not add URL fetching or Sharp until packaging and transport are proven.

## Phase 2 — Shared URL audit core

### Deliverables

- Create packages/url-audit-core.
- Extract the existing secure public-resource fetcher.
- Extract inert HTML image discovery and schemas.
- Preserve DNS pinning, redirects, streaming limits, and MIME checks.
- Define HTML/image budgets and framework-independent stable errors.
- Update current Next.js routes to consume the package.
- Add local malicious-server fixtures.

### Required cases

- malformed URLs and credentials
- localhost, private, link-local, metadata, IPv6, and mapped IPv4
- public-to-private and excessive redirects
- oversized declared and chunked bodies
- deadlines, MIME spoofing, and DNS pinning

### Acceptance criteria

- Existing Image URL and Website URL flows retain behavior.
- Web and MCP use the same security implementation.
- The shared package has no React or Next.js dependency.
- Mandatory security fixtures pass and behavior is deny-by-default.

### Stop point

Do not expose an MCP network tool until the shared boundary passes.

## Phase 3 — Public webpage audit tool

### Deliverables

- Implement audit_webpage_images with Zod inputs/outputs.
- Fetch only through the shared security boundary.
- Discover img, srcset, picture, lazy, metadata, and preload candidates.
- Deduplicate and order candidates deterministically.
- Inspect with bounded concurrency and an overall operation budget.
- Report final URL, MIME, bytes, dimensions, and format when measurable.
- Represent unknown measurements explicitly.
- Add read-only/open-world annotations.

### Acceptance criteria

- maxImages and truncation are truthful.
- Counts and knownBytes are accurate.
- One candidate failure does not fail the audit.
- IDs and ordering are deterministic.
- Candidate fetches cannot reach blocked destinations.
- Output matches its schema and all resource limits are enforced.

### Stop point

Produce an internal 0.1.0-alpha demonstration before filesystem writes.

## Phase 4 — Workspace image audit tool

### Deliverables

- Implement trusted workspace-root configuration.
- Require server-approved roots and optionally narrow them with MCP client roots.
- Implement audit_workspace_images.
- Support JPEG, PNG, WebP, and static AVIF.
- Reject animated and signature-mismatched files.
- Bound recursion, file count, source bytes, and decoded pixels.
- Detect exact duplicates by content hash.
- Return deterministic plans and proposed destinations.
- Add read-only/closed-world annotations.

### Required cases

- parent traversal and absolute paths outside roots
- symlink and junction escapes
- Windows reserved paths and device files
- inaccessible/partial files and excessive directory depth
- mixed supported and unsupported batches

### Acceptance criteria

- The tool performs no writes.
- Every result path is workspace-relative.
- Files outside roots cannot be inspected.
- Limits and skipped reasons are structured.
- Unchanged scans return stable IDs and ordering.

### Stop point

Do not implement writes until containment passes on supported systems.

## Phase 5 — Safe single-image optimization

### Deliverables

- Implement optimize_image for one approved local image or public URL.
- Fetch URLs only through the shared security boundary.
- Use Sharp with decoded-pixel limits.
- Support JPEG, PNG, WebP, and static AVIF input.
- Verify every advertised output format at runtime.
- Normalize orientation and remove metadata by default.
- Preserve transparency except for explicit JPEG background conversion.
- Implement bounded target search with a quality floor and attempt ceiling.
- Reduce dimensions only when smart fit is explicitly requested.
- Commit only a new authorized destination atomically.
- Emit hashes, settings, encoder version, and provenance.

### Acceptance criteria

- Existing files are never overwritten.
- Failure leaves no partial destination.
- targetMet is true only when output satisfies the target.
- Unreachable targets return truthful best-candidate information.
- Extension, signature, MIME, and reported format agree.
- Output remains beneath an approved root.
- Cancellation releases buffers and temporary files.

### Stop point

Do not add batch writes until single-file containment and cleanup are proven.

## Phase 6 — Plans and batch application

### Deliverables

- Define a versioned optimization-plan schema.
- Implement apply_image_optimization_plan.
- Accept only plans produced by an audit contract.
- Revalidate sources/destinations and detect changed source hashes.
- Use bounded concurrency and independent per-item failures.
- Create files in a dedicated output directory.
- Write replacement-manifest.json with mappings, settings, hashes, and outcomes.
- Use deterministic collision-safe naming.

### Acceptance criteria

- Plans cannot authorize paths outside roots.
- Cancellation stops new work and removes temporary files.
- Successful outputs survive unrelated failures.
- The manifest exactly matches committed files.
- Repeated application never silently overwrites outputs.

### Stop point

Do not edit source code, run Git operations, or overwrite original images.

## Phase 7 — Policy file and CI budget command

### Deliverables

- Define a versioned .compressbyurlrc.json schema.
- Support global and path-specific byte/dimension budgets.
- Add a read-only CLI check backed by the workspace audit core.
- Provide human-readable and JSON output.
- Document stable pass, budget-failure, and execution-error exit codes.
- Add GitHub Actions guidance without requiring a hosted account.

### Acceptance criteria

- MCP and CLI produce identical findings for the same inputs.
- Invalid policies fail closed.
- CI output excludes bytes, secrets, and private absolute paths.
- Exit codes are stable and local checks require no network.

### Stop point

Do not add hosted dashboards, accounts, databases, or telemetry.

## Phase 8 — Packaging and public release

### Deliverables

- Complete README and tool reference from shipped schemas.
- Add configuration examples for supported MCP hosts.
- Document PATH, Sharp, and stdio troubleshooting.
- Add security policy, changelog, and semantic-versioning policy.
- Add CI for supported Node and operating-system combinations.
- Test the npm tarball on clean Windows, macOS, and Linux.
- Verify the current MCP Inspector and at least two real clients.
- Configure npm provenance or trusted publishing.

### Release criteria

- A clean user launches the package with one documented npx command.
- No source checkout or global dependency is required.
- No stdout contamination occurs.
- Security, contract, containment, and packaging suites pass.
- Package metadata and public documentation match shipped behavior.

## Deferred opportunities

- Streamable HTTP or hosted MCP
- accounts, authentication, databases, or cloud storage
- browser-rendered LCP and headless scanning
- automatic source-code edits, Git commits, or pull requests
- in-place replacement and full-domain crawling
- animated formats or general image editing

Possible later differentiators include React/Next.js source-reference discovery,
responsive srcset generation, framework-aware replacement snippets, and visual-quality
metrics. Each needs a separately approved workstream.

## Definition of done

The workstream is complete only when the package installs independently; schemas are
validated; network and filesystem security suites pass; outputs are truthful and
reproducible; original files are not silently overwritten; Inspector and real-client
compatibility are verified; CLI and MCP audits agree; release/security documentation is
public; and the existing web product remains functional and private-by-default.

## Progress evidence

For every completed phase record commands run, fixtures exercised, clients/platforms
verified, and deferred work. Code presence alone does not complete a phase.

### Phase 0 — completed 2026-09-22

- Selected compressbyurl-mcp 0.1.0, MIT, stdio-only, and Node.js 22.19+.
- Selected Windows x64, macOS arm64, and Ubuntu Linux x64 release targets.
- Added npm workspaces, public/private package manifests, and root workspace scripts.
- Added docs/mcp/00-decisions.md and docs/mcp/01-tool-contracts.md.
- Registry availability was checked; npm authentication/trusted publishing remains a
  Phase 8 release gate because this machine is not logged into npm.
- npm ci --ignore-scripts completed with zero dependency-resolution failures.
- npm query .workspace found both intended workspaces.
- Existing web typecheck and lint passed; lint retained unrelated warnings only.
- Existing web development server started and GET / returned HTTP 200.
- Changed-file Prettier and Git diff checks passed.

### Phase 1 — completed 2026-09-22

- Added the independently publishable compressbyurl-mcp package and strict NodeNext
  TypeScript configuration.
- Implemented the MCP v2 server factory and typed get_server_info tool with matching
  text and structured output.
- Added stable tool-error helpers, package/version consistency checks, and five passing
  foundation tests.
- Added a raw stdio smoke verifier covering initialize, tools/list, successful
  tools/call, rejected arguments, and protocol-only stdout.
- MCP Inspector independently listed and invoked the built server; invalid arguments
  returned isError without crashing the protocol.
- npm pack included only the intended 23 files, including LICENSE, README, declarations,
  source maps, and built runtime.
- Installed the tarball into a temporary consumer outside the repository and invoked it
  successfully through MCP Inspector.
- Root typecheck, MCP verification, changed-file formatting, lint, and diff checks
  passed. Root lint retained unrelated .agents warnings only.

### Phase 2 — completed 2026-09-22

- Added the private framework-independent URL audit core with strict TypeScript,
  package subpath exports, and no React or Next.js dependencies.
- Moved URL validation, address policy, DNS pinning, redirect validation, streaming
  byte limits, operation deadlines, content-type checks, HTML discovery, schemas, and
  static-image signature checks into the shared package.
- Updated the Website URL route, Image URL route, and browser file intake to consume
  shared implementations without changing the existing public API behavior.
- Added 19 passing core tests covering public/private/loopback/link-local/metadata,
  IPv6 and mapped IPv4 policy; a pinned synthetic DNS destination; malformed and
  credential-bearing URLs; redirects; declared and streamed size limits; timeout;
  candidate extraction/deduplication/truncation; MIME spoofing; and animated/static
  JPEG, PNG, WebP, and AVIF signatures.
- Core verification, MCP verification, root typecheck, and lint completed. Lint retained
  unrelated warnings in vendored `.agents` scripts and reported zero errors.
- Next.js development integration returned HTTP 200 for `/`; both URL endpoints
  rejected loopback/metadata destinations with `UNSAFE_DESTINATION`.

### Phase 3 — completed 2026-09-22

- Added the strict `audit_webpage_images` input/output schemas and read-only,
  idempotent, open-world MCP registration without making browser-rendered or LCP
  claims.
- Implemented inert candidate discovery across image, lazy, srcset, picture, metadata,
  and preload sources with unique source aggregation, deterministic IDs/order, truthful
  unique counts, `maxImages`, and truncation.
- Added public-only candidate fetching, DNS-pinned shared transport, concurrency 4,
  2 MB page/8 MB image/64 MB aggregate byte limits, a 40 MP decoded-pixel limit, and
  a 30-second operation deadline.
- Added Sharp metadata inspection, byte/dimension/format evidence, partial per-candidate
  errors, stable issue codes, conservative recommendations, and explicit unknowns.
- Added 12 passing MCP tests, including partial failure, deterministic aggregation,
  default/strict inputs, real Sharp decoding, the aggregate byte ceiling, and measured
  concurrency.
- Raw stdio verification listed/invoked both tools, rejected invalid arguments, blocked
  loopback by default, and confirmed protocol-only stdout.
- MCP Inspector strict schema validation reported zero findings. Inspector successfully
  audited `https://example.com/` and returned schema-valid structured output, and an
  unsafe loopback audit returned `UNSAFE_DESTINATION`.
- Packed nine intended files, installed the tarball into a clean temporary consumer,
  and successfully listed/invoked it through Inspector. The private core is bundled;
  its third-party runtime dependencies remain ordinary published dependencies.
- Core verification, MCP verification, root typecheck, lint, Git diff checks, and
  Next.js development integration passed. Lint retained only unrelated `.agents`
  warnings.

### Phase 4 — completed 2026-09-22

- Added strict `audit_workspace_images` contracts, read-only/closed-world annotations,
  opaque configured-root IDs, structured skipped reasons, deterministic optimization
  proposals, and a versioned read-only plan.
- Added repeatable human-controlled `--workspace-root` startup configuration as the
  hard authorization boundary, with real-path client-root narrowing when supplied.
- Enforced workspace-relative input, traversal/absolute/device-name rejection,
  real-path containment, no symlink or junction following, regular-file checks,
  no-follow file opens where supported, and file-change detection.
- Added depth 20, 1,000-file, 10,000-entry, 25 MB per-file, 256 MB aggregate-source,
  40 MP decoded-pixel, concurrency 4, and 1,000 skipped-result limits.
- Added static JPEG, PNG, WebP, and AVIF runtime inspection; signature/extension and
  animation rejection; SHA-256 exact-duplicate detection; stable IDs/order; relative
  paths only; and deterministic collision-safe proposed destinations.
- Added 19 passing MCP tests covering root intersection/selection, traversal, absolute
  and Windows reserved paths, symlink/junction escape, corrupt and partial images,
  MIME spoofing, animation, unsupported formats, oversized sources, duplicates,
  recursion depth, file truncation, cancellation, deterministic rescans, no writes,
  and all four advertised formats through the shipped Sharp runtime.
- Added a workspace stdio smoke that audits, optimizes, and applies a plan beneath its
  approved startup root without depending on deprecated client roots. Unit coverage
  still proves that supplied client roots narrow the approved boundary. The default
  stdio smoke proves workspace access fails closed without startup approval.
- MCP Inspector strict schema validation reported zero findings; package verification,
  dry-run packing (nine intended files), root typecheck/lint, and Git diff checks passed.
  Root lint retained only unrelated `.agents` warnings.

### Phase 5 — completed 2026-09-22

- Added the strict `optimize_image` contract for one approved workspace image or URL,
  with mutually exclusive quality/target modes, explicit smart-fit controls, and
  format-matched destinations.
- Reused the shared DNS-pinned URL security boundary and workspace-root intersection,
  containment, no-symlink, no-follow, bounded-source, and file-change protections.
- Added Sharp-backed JPEG, PNG, WebP, and static AVIF encoding with a 40 MP decoded
  pixel ceiling, orientation normalization, metadata removal, alpha preservation, and
  an explicit background requirement for transparent-to-JPEG conversion.
- Added bounded target search (quality 40–92, at most 12 attempts), optional smart-fit
  resizing, truthful `targetMet`, and best-candidate warnings for unreachable targets.
- Added verified signature/metadata checks for every encoded candidate and emitted
  source/output hashes, measured sizes, applied settings, encoder version, provenance,
  savings, and structured warnings.
- Added exclusive same-directory temporary writes and atomic hard-link commits so an
  existing or concurrently created destination is never overwritten; normal failure
  and cancellation remove temporary files.
- Expanded the MCP suite to 28 passing tests, including all four encoders, metadata and
  orientation handling, transparency, unreachable targets, attempt ceilings, path and
  junction escapes, URL policy, concurrent destination races, cancellation cleanup,
  and unchanged source/existing destination assertions.
- Raw and workspace-root stdio smoke tests listed and invoked all four tools, including
  a successful optimization and a fail-closed call without an approved root. MCP
  Inspector strict schema validation reported zero findings.
- Full package verification, nine-file dry-run packing, root typecheck, zero-error
  lint, formatting, and Git diff checks passed. Root lint retained only unrelated
  vendored `.agents` warnings.

### Phase 6 — completed 2026-09-22

- Added the strict `apply_image_optimization_plan` input/output contracts and exposed
  it as a non-destructive, workspace-only MCP write tool.
- Recomputed every deterministic plan ID, bound each plan to the selected root, capped
  plans at 1,000 items, required unique IDs/sources/destinations, and required every
  destination to be a direct child of the requested output directory.
- Required a new dedicated output directory beneath the approved/client-root
  intersection; validated existing parents and symlink/junction containment; and
  refused to reuse or overwrite an existing output directory.
- Revalidated every local source through the Phase 5 safety path and compared its
  SHA-256 with the audit plan before encoding or committing an output.
- Applied at most two items concurrently with ordered independent outcomes. Changed or
  invalid sources fail individually while unrelated successful outputs survive.
- Wrote the complete schema-validated batch result as an exclusively committed
  `replacement-manifest.json`, including mappings, hashes, settings, byte totals,
  limits, warnings, and succeeded/failed/cancelled outcomes.
- Expanded the MCP suite to 33 passing tests, including exact manifest parity,
  successful batch application, changed-source partial failure, altered plan IDs,
  redirected destinations, repeat application/no overwrite, cancellation/no writes,
  strict input contracts, and unchanged sources.
- Expanded raw stdio verification to five tools and proved batch application fails
  closed without an approved root. The workspace stdio test completed audit → single
  optimization → plan application → manifest creation through the protocol.
- MCP Inspector strict schema validation reported zero findings. Full package
  verification, nine-file dry-run packing, root typecheck, zero-error lint, Git diff
  checks, and a Next.js development `GET /` HTTP 200 passed. Root lint retained only
  unrelated vendored `.agents` warnings.

### Phase 7 — completed 2026-09-22

- Added a strict version 1 `.compressbyurlrc.json` schema with global byte/width/height
  budgets and up to 100 ordered path-specific override rules.
- Added deterministic workspace-relative glob matching for `*`, `?`, and whole-segment
  `**`; rejected traversal, absolute/backslash patterns, unsupported glob syntax,
  unknown fields, empty budgets, and out-of-range values.
- Added the local read-only `compressbyurl-mcp check` command with human and compact
  JSON output, root/policy/directory/file-limit options, no network access, and stable
  exits 0 (pass), 1 (budget failure), and 2 (configuration/execution error).
- Reused the exact `auditWorkspaceImages` result in CLI output and added deterministic
  budget findings without raw image contents, environment data, policy contents, or
  private absolute paths.
- Made corrupt/inaccessible supported files, containment failures, and truncated scans
  fail closed. Unsupported formats remain explicit audit skips while supported files
  are still checked.
- Corrected subdirectory audit reporting so all source/skipped/plan paths are genuinely
  workspace-relative; plans produced from a subdirectory now apply successfully.
- Added policy/CLI documentation, a complete example policy, stable-exit reference, and
  GitHub Actions guidance that needs no hosted CompressByURL account.
- Expanded the MCP suite to 42 passing tests, including schema closure, glob semantics,
  override precedence, exact MCP/CLI audit equality, privacy assertions, invalid and
  incomplete policies, unsupported formats, all exit codes, and subdirectory plan use.
- Added a built CLI smoke verifier for pass, budget-failure, execution-error, help, and
  privacy behavior. The real repository public tree was checked locally: 24 supported
  images were inspected and the example policy truthfully returned exit 1 for two
  violations while reporting three unsupported-format skips.
- Full package verification, five-tool stdio workflows, Inspector strict validation
  with zero findings, nine-file dry-run packing, root typecheck, zero-error lint, and
  Git diff checks passed. Root lint retained only unrelated vendored `.agents` warnings.

### Phase 8 — in progress 2026-09-22

- Replaced the package README with complete quick-start, five-tool reference,
  policy/CLI guide, security/privacy model, Codex/VS Code/Claude configurations,
  PATH/Sharp/stdio/root troubleshooting, development checks, and SemVer/schema policy.
- Added packaged `SECURITY.md` and `CHANGELOG.md`, repository security guidance, and a
  detailed release procedure with first-publication, trusted-publishing, client,
  provenance, and rollback gates.
- Added a Windows x64, Ubuntu x64, and macOS arm64 GitHub matrix across Node 22.19, 24,
  and 26, plus an OIDC-only protected-environment publish workflow with exact tag and
  package-version validation.
- Added a clean-consumer verifier that packs the real artifact, installs it outside the
  repository, invokes the installed npm bin, runs a Sharp-backed policy audit,
  initializes the MCP server, and lists all five tools. The same verifier now also
  launches the tarball through one ephemeral `npm exec --package` command and completes
  the protocol handshake without a source checkout or global dependency.
- Fixed npm 11 bin normalization discovered by `npm publish --dry-run`; the repeated
  publish rehearsal now reports no package-metadata corrections. The artifact contains
  only the intended 11 files, including release/security docs.
- Full Windows clean-install and protocol/policy smokes passed under Node 22.19.0,
  24.21.0, and 26.9.0. The production dependency audit reported zero known
  vulnerabilities.
- Registry checks reconfirmed every direct runtime dependency version and that
  `compressbyurl-mcp` remains unclaimed. npm authentication is confirmed as `shadowpool`;
  the credential remains local and is not stored in repository or workflow files.
- actionlint 1.7.12 reported no findings for either GitHub workflow. Gitleaks 8.30.1
  reported no findings across repository history or the current release-relevant
  worktree; both temporary validators were SHA-256 verified and removed afterward.
- Added a release-surface contract test that keeps the npm name/version/license,
  executable, allowlisted package files, public access, Node engine, repository metadata,
  bundled-private-core boundary, five documented tools, changelog, security reporting,
  and license text synchronized. The MCP suite now contains 43 passing tests.
- Split the public package into a side-effect-free `createMcpServer` library export and
  a dedicated CLI binary after the completion audit found that importing the old shared
  entry could start stdio. A clean tarball consumer now proves importing the package is
  silent and returns the factory, while `npx` and direct CLI protocol paths still pass.
- MCP Inspector strict schema validation reported zero findings. Codex CLI
  0.155.0-alpha.9.2 initialized the server and invoked both `get_server_info` and a real
  `audit_workspace_images` call. The workspace security model was aligned with the
  current MCP standard: explicit server roots remain mandatory, while deprecated MCP
  client roots are optional narrowing hints rather than an authorization mechanism.
  Claude Code 2.1.278 accepted the server in a disposable profile and its native health
  check reported `Connected`; invoking a tool still requires a logged-in Claude account.
- Independent client `@wong2/mcp-cli` 2.0.0 launched the built stdio server and invoked
  both `get_server_info` and `audit_workspace_images`; the latter returned one measured
  workspace image. Together with Codex, this completes the two-client compatibility
  gate without changing user configuration or requiring credentials.
- The GitHub repository is public, satisfying npm's public-source prerequisite for
  automatic provenance when the public package is published through trusted GitHub
  Actions OIDC.

Phase 8 is locally release-ready but externally blocked. Completion requires the
nine-job GitHub matrix to pass on the release commit, npm first-publication and
trusted-publisher setup, and a final clean registry install. Repository visibility and
npm login prerequisites are complete. No package has been published.
