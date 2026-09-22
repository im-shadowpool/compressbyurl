# MCP Release Procedure

Status: `compressbyurl-mcp@0.1.0` published and verified.

Date checked: 2026-09-23

## Release targets

- Package: `compressbyurl-mcp`
- Initial version/tag: `0.1.0` / `v0.1.0`
- Registry visibility: public
- Transport: local stdio
- Node.js: 22.19+, with CI on 22.19, 24, and 26
- Platforms: Ubuntu Linux x64, Windows x64, and macOS arm64

The public registry reports version `0.1.0` with `latest` pointing to it. Its `gitHead`
is `799edc94adc084b7000831b291bbc7a952fe6bc2`, the same commit as the `v0.1.0`
tag, and its tarball SHA-1 is `62a5bb649b14facdcd71c626a449b847fd2fa162`.

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
All nine jobs passed on the release PR and again on the merged release commit before
publication.

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

The npm trusted publisher is configured for subsequent versions:

| npm field         | Value                |
| ----------------- | -------------------- |
| Provider          | GitHub Actions       |
| Organization/user | `im-shadowpool`      |
| Repository        | `compressbyurl`      |
| Workflow filename | `mcp-publish.yml`    |
| Environment       | `npm`                |
| Allowed action    | direct `npm publish` |

The GitHub `npm` environment exists and requires approval from `im-shadowpool`. The
trusted relationship permits direct publishing from the named workflow and environment.
After the first OIDC release succeeds, set npm publishing access to require 2FA and
disallow traditional tokens.

The first version was published interactively by the `shadowpool` npm account with
account 2FA enabled, after the full CI matrix passed. Keep that credential local; do
not copy it into the repository or workflows.

## Provenance and repository visibility

The GitHub repository and npm package are public. Version `0.1.0` was bootstrapped
interactively, so it has a registry signature but no GitHub provenance attestation.
The npm version is immutable; do not attempt to republish `0.1.0`. A later version
published through the configured trusted GitHub Actions workflow can receive automatic
provenance.

## Release record and next-version procedure

1. Pull request [#1](https://github.com/im-shadowpool/compressbyurl/pull/1) was merged
   by the owner. The release commit passed all nine matrix jobs.
2. npm account 2FA was enabled and `compressbyurl-mcp@0.1.0` was published from that
   exact commit. The release artifact contains 11 intended files.
3. The `v0.1.0` tag and
   [GitHub release](https://github.com/im-shadowpool/compressbyurl/releases/tag/v0.1.0)
   point to the registry's `gitHead`. The release author is `im-shadowpool`.
4. A fresh registry install imported the side-effect-free library entry, ran the policy
   CLI, listed all five tools over stdio, and invoked `get_server_info`. `npm audit
   signatures` verified the registry signatures for all 34 installed packages; the 10
   attestations reported belong to dependencies, not this initial package version.
5. For the next version, update package and changelog versions, run the full matrix on
   the exact release commit, create its version tag and GitHub release, approve the
   protected `npm` environment, then verify the OIDC publish, registry install, and
   package provenance. Never reuse a published version number.

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
