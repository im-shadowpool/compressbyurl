# Changelog

All notable changes to `compressbyurl-mcp` are documented here. The package follows
[Semantic Versioning](https://semver.org/).

## [0.1.0] - Unreleased

### Added

- Stdio MCP server with strict versioned input/output schemas.
- Public webpage and authorized workspace image audits.
- Safe single-image optimization for JPEG, PNG, WebP, and static AVIF.
- Versioned workspace optimization plans and isolated batch application manifests.
- Read-only local image-budget policy checks for CI.
- SSRF defenses, DNS pinning, redirect/byte/pixel/deadline budgets, approved-root
  containment with optional client-root narrowing, path containment, symlink/junction
  rejection, exclusive writes, and no-overwrite behavior.
- Current-standard workspace authorization: explicit server roots are mandatory while
  deprecated MCP client roots can only narrow access.
- Separate side-effect-free library export for `createMcpServer` and executable CLI
  entry, with clean-consumer import verification.
- Windows x64, macOS arm64, and Ubuntu Linux x64 release verification workflow.

[0.1.0]: https://github.com/im-shadowpool/CompressByURL/releases/tag/v0.1.0
