# MCP Workstream Decisions

Status: accepted for Phase 0

Date: 2026-09-22

## Repository model

The MCP server remains in the CompressByURL repository but is independently packaged.
The completed Next.js application stays at the repository root.

- packages/mcp is the public MCP package.
- packages/url-audit-core is a private workspace shared by the web app and MCP.
- The private core will be bundled into the public MCP artifact rather than published
  as a separately supported package.

This keeps security behavior in one implementation without coupling MCP to React,
Next.js, browser workers, or browser codecs.

## Package identity

The public npm package is compressbyurl-mcp at initial version 0.1.0.

Registry checks on 2026-09-22 returned not-found responses for both
compressbyurl-mcp and @compressbyurl/mcp. The unscoped name was selected because it
does not require ownership of an npm organization and supports the simple launch form:

    npx -y compressbyurl-mcp

The name is not reserved until the first npm publication. This machine is not logged
into npm. Trusted publishing and final name availability are mandatory Phase 8 release
gates; publishing must never silently fall back to a different package name.

## Licensing

The repository and MCP package use the MIT License. Copyright is attributed to
CompressByURL contributors.

## Runtime and platforms

- Package engine: Node.js 22.19 or newer.
- Primary deployment/runtime target: Node.js 24 LTS.
- Compatibility targets for release CI: Node.js 22, 24, and the current supported
  release when Phase 8 begins.
- Release operating systems: Windows x64, macOS arm64, Ubuntu Linux x64.
- Other Sharp-supported platforms are best-effort until explicitly added to CI.

The development host currently uses Node.js 26.9.0 and npm 11.19.1. Node 24 behavior
must be verified in CI before release.

## Protocol and transport

- Use the stable MCP TypeScript server v2 package.
- The first public release supports local stdio only.
- stdout is protocol-only; diagnostics use stderr.
- Streamable HTTP, authentication, and hosted MCP are deferred.

## Dependency policy

- Zod 4 defines all input/output contracts.
- Sharp performs Node-side inspection and encoding.
- Sharp and the MCP server SDK remain external runtime dependencies.
- The private URL audit core is bundled into the public MCP distribution.
- Exact dependency versions are locked in this repository; public package ranges follow
  semver-compatible stable releases.

Registry checks during Phase 0 observed:

- @modelcontextprotocol/server 2.0.0
- sharp 0.35.4
- zod 4.6.5

Versions must be checked again when Phase 8 begins.

## Security and privacy

- Public HTTP/HTTPS fetching is deny-by-default and SSRF protected.
- Localhost is available only through a human-controlled startup option.
- Filesystem access is restricted to explicit server-approved roots. Deprecated MCP
  client roots are optional narrowing hints, never the authorization boundary.
- Initial releases never overwrite source files.
- No telemetry, accounts, database, cloud storage, or image upload service is included.
- Tool results use workspace-relative paths and never expose secrets.

## Release ownership

- Source repository: https://github.com/im-shadowpool/CompressByURL
- Release mechanism: GitHub Actions with npm trusted publishing and provenance.
- A human repository owner must configure the npm/GitHub trust relationship before the
  first public release.
- No long-lived npm token should be committed or placed in project configuration.

## Initial contracts

The normative Phase 0 tool contracts live in docs/mcp/01-tool-contracts.md. Later phases
may extend them only through versioned, backward-compatible changes or an explicitly
documented breaking version.

## Explicit non-goals for 0.1.0

- remote/hosted MCP
- in-place file replacement
- source-code edits or Git operations
- headless browser rendering
- full-domain crawling
- animated image optimization
- general image editing
