# Security Policy

## Supported versions

`compressbyurl-mcp` is preparing its first public alpha release. After publication,
the latest 0.1.x release will receive security fixes. Older alpha versions may require
upgrading rather than receiving a backport.

## Report a vulnerability privately

Do not open a public issue for a suspected vulnerability. Use the repository's
[private vulnerability reporting](https://github.com/im-shadowpool/compressbyurl/security/advisories/new)
form and include:

- the affected version and operating system;
- the MCP host and exact startup flags;
- a minimal reproduction without real secrets or private files;
- the expected and observed security boundary; and
- whether the issue involves network access, path containment, file writes, or output
  disclosure.

Please do not access data you do not own, degrade third-party services, or publish a
working exploit before maintainers have had a reasonable opportunity to investigate.

## Security boundaries

- Public URL access is SSRF protected and private/metadata destinations are denied.
- Workspace reads/writes require an explicit server-approved root. A supplied MCP
  client root can only narrow that boundary.
- Source images and existing destinations are never overwritten.
- The package has no telemetry, accounts, hosted service, database, or secret store.
- Tool and CI output uses public URLs or workspace-relative paths, not private absolute
  paths.

These controls reduce risk but do not make untrusted MCP servers safe. Review commands
before adding any local stdio server and use host approval/sandbox controls where
available.
