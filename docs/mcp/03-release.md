# MCP Release Procedure

Status: release candidate prepared; remote CI and registry publication remain open.

Date checked: 2026-09-22

## Release targets

- Package: `compressbyurl-mcp`
- Initial version/tag: `0.1.0` / `v0.1.0`
- Registry visibility: public
- Transport: local stdio
- Node.js: 22.19+, with CI on 22.19, 24, and 26
- Platforms: Ubuntu Linux x64, Windows x64, and macOS arm64

Registry checks confirmed that `compressbyurl-mcp` is still unclaimed. Current registry
versions also still match the locked release dependencies: MCP server 2.0.0, Sharp
0.35.4, Zod 4.6.5, Cheerio 1.2.0, Undici 8.10.2, and ipaddr.js 2.5.0.

## Automated verification

`.github/workflows/mcp-ci.yml` runs the production dependency audit, MCP/core tests,
protocol smokes, strict schemas, all four codecs, dry-run packing, and a clean tarball
install on this matrix:

| Runner           | Architecture | Node versions |
| ---------------- | ------------ | ------------- |
| `ubuntu-latest`  | x64          | 22.19, 24, 26 |
| `windows-latest` | x64          | 22.19, 24, 26 |
| `macos-latest`   | arm64        | 22.19, 24, 26 |

The macOS architecture follows the current
[GitHub-hosted runner reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).
No release may be published until all nine jobs pass on the exact release commit.

Local release rehearsal:

```sh
npm ci
npm run mcp:release-check
npm pack --dry-run --workspace compressbyurl-mcp
```

The clean-install verifier packs the real artifact, installs it into a new external
consumer, runs the policy CLI through Sharp, initializes the installed MCP server, and
lists all tools without relying on the source workspace. It also launches the tarball
directly through one ephemeral `npm exec --package` command and completes an MCP
initialize/tools-list exchange, mirroring the documented `npx` installation path.

The two workflow files also pass actionlint 1.7.12. Gitleaks 8.30.1 reported no
findings across Git history or the current release-relevant worktree files. Both
downloaded validators were checked against their GitHub release SHA-256 digests before
execution. These automated checks do not replace the owner's final private-data review
before changing repository visibility.

## Trusted publishing

The `mcp-publish.yml` workflow uses GitHub-hosted Ubuntu, `id-token: write`, Node 24,
explicitly pinned npm 11.19.1, no npm token, an early exact release tag/version check,
and `npm publish`. This exceeds npm's 11.5.1 minimum and follows its current
[trusted publishing guidance](https://docs.npmjs.com/trusted-publishers/).

After the first package exists, a human npm owner must configure this trusted publisher
in the package settings:

| npm field         | Value                |
| ----------------- | -------------------- |
| Provider          | GitHub Actions       |
| Organization/user | `im-shadowpool`      |
| Repository        | `CompressByURL`      |
| Workflow filename | `mcp-publish.yml`    |
| Environment       | `npm`                |
| Allowed action    | direct `npm publish` |

Create a protected GitHub environment named `npm` and require maintainer approval.
After the OIDC release works, set npm publishing access to require 2FA and disallow
traditional tokens.

This machine is authenticated to npm as `shadowpool`. Keep that credential local: do
not copy it into the repository, workflow files, logs, or pull-request text. The initial
registry bootstrap must run only after the exact release commit passes the full CI matrix.

## Provenance and repository visibility

The GitHub repository is public. This satisfies npm's public-source requirement for
automatic provenance when a public package is published through trusted GitHub Actions
OIDC.

## First-publication sequence

1. Resolve repository visibility and review all tracked files for secrets/private data.
2. Push the release workflows and require the full matrix on `main`.
3. Verify MCP Inspector and two actual supported hosts from the release tarball.
4. Log into npm with a maintainer account protected by 2FA.
5. Reconfirm the package name and perform the minimum first-publication/bootstrap step
   required by npm so the package settings exist.
6. Configure the trusted publisher values above and remove/revoke any bootstrap token.
7. Create tag `v0.1.0` from the verified commit and publish a GitHub release.
8. Approve the protected `npm` environment; the OIDC workflow publishes the package.
9. Verify `npm view compressbyurl-mcp@0.1.0`, install it in a fresh directory, and run
   MCP Inspector plus the two real hosts again.
10. If the repository is public, confirm the provenance badge and run
    `npm audit signatures` from a clean install.

## Client release gate

The current MCP Inspector strict check is automated. Codex CLI 0.155.0-alpha.9.2 was
also tested on Windows with an ephemeral inline configuration: it initialized the
server and called `get_server_info`, returning `compressbyurl-mcp 0.1.0`.

A second Codex test supplied `--workspace-root` and requested a workspace audit. Codex
did not advertise a client file root, but the audit succeeded beneath the explicit
server-approved root and reported one inspected image. This follows the current
[MCP roots specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/client/roots.mdx),
which deprecates roots and defines them as informational rather than an access-control
mechanism. A supplied client root can only narrow the server-approved boundary.

Claude Code 2.1.278 was tested through an ephemeral `npx` install and a disposable
configuration directory. Its native `mcp list` and `mcp get` health checks reported the
server as connected. A model-driven tool invocation could not run because no Claude
account was logged in. VS Code/Claude Desktop are not installed on this host.

As a second independent client, `@wong2/mcp-cli` 2.0.0 launched the built package over
stdio and successfully called both `get_server_info` and `audit_workspace_images`.
Together with Codex, this satisfies the two-client compatibility gate; Claude's native
health check supplies an additional launch/handshake check.

Record client versions and operating systems without committing user configuration,
tokens, private absolute paths, or screenshots containing private data.

## Rollback

Never overwrite or reuse an npm version. For a faulty alpha:

- deprecate the affected version with a concise migration message;
- fix forward in a new SemVer version;
- update `CHANGELOG.md`; and
- rotate/revoke credentials only if credential compromise is suspected (trusted OIDC
  publishing has no long-lived publish token to rotate).
