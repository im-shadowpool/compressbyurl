# compressbyurl-mcp

Local Model Context Protocol server for measuring and safely optimizing static web
image assets. Version 0.1.0 is an alpha release for local stdio hosts.

- Audits inert webpage HTML without claiming browser-rendered or actual LCP results.
- Audits only beneath an explicit human-approved server root; a client file root
  narrows that boundary when the host supplies one.
- Optimizes JPEG, PNG, WebP, and static AVIF without replacing source files.
- Applies deterministic audit plans into a new dedicated output directory.
- Runs read-only image-budget checks locally in CI.
- Has no telemetry, account, database, hosted service, or image upload.

## Requirements

- Node.js 22.19 or newer; Node.js 24 LTS is the primary release runtime.
- An MCP host with local stdio support.
- For workspace tools, an explicit `--workspace-root` startup flag.

## Quick start

Start the MCP server through `npx`:

```sh
npx -y compressbyurl-mcp
```

That mode can report server information and audit public webpages. Workspace reads and
all writes fail closed until a trusted absolute root is approved:

```sh
npx -y compressbyurl-mcp --workspace-root /absolute/path/to/project
```

Windows example:

```powershell
npx -y compressbyurl-mcp --workspace-root "C:\path\to\project"
```

Repeat `--workspace-root` to approve more than one location. When more than one root is
available, pass an opaque `rootId` reported by `get_server_info`; tools never return the
private absolute root path.

Public and private network destinations are denied by default except ordinary public
HTTP/HTTPS. For deliberate local-development testing only, a human may add
`--allow-loopback`; private LAN and cloud metadata addresses remain denied.

### Programmatic server factory

The package root is a side-effect-free library entry. It does not start stdio when
imported:

```js
import { createMcpServer } from "compressbyurl-mcp";

const server = createMcpServer({
  workspaceRoots: ["/absolute/path/to/project"],
});
```

Connect the returned server to a transport owned by the embedding host. The executable
used by `npx` remains the supported ready-to-run stdio entry.

## MCP host configuration

### Codex and the ChatGPT desktop app

The official [Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp)
supports stdio servers through the CLI, desktop settings, IDE settings, or
`config.toml`.

```sh
codex mcp add compressbyurl -- npx -y compressbyurl-mcp
```

Equivalent `~/.codex/config.toml` entry:

```toml
[mcp_servers.compressbyurl]
command = "npx"
args = ["-y", "compressbyurl-mcp"]
startup_timeout_sec = 30
tool_timeout_sec = 120
default_tools_approval_mode = "writes"
```

Restart the host after changing configuration. The ChatGPT desktop app, Codex CLI, and
Codex IDE extension share the same configuration on a Codex host.

For workspace tools, append `--workspace-root` and the absolute project path to the
`args` array. Codex CLI 0.155 was verified with both `get_server_info` and a real
`audit_workspace_images` call. Codex does not currently advertise MCP client roots;
the explicit startup root remains the hard filesystem boundary.

### Visual Studio Code

Create `.vscode/mcp.json` as described by the official
[VS Code MCP configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration):

```json
{
  "servers": {
    "compressbyurl": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "compressbyurl-mcp", "--workspace-root", "${workspaceFolder}"]
    }
  }
}
```

On macOS and Linux, VS Code can additionally sandbox local stdio servers. Permit the
workspace if you intend to use optimization tools.

### Claude Code and Claude Desktop

The official [Claude Code MCP guide](https://code.claude.com/docs/en/mcp) supports a
project-scoped stdio server:

```sh
claude mcp add compressbyurl --scope project -- npx -y compressbyurl-mcp --workspace-root /absolute/path/to/project
```

Or add this `.mcp.json` at the project root and approve it interactively:

```json
{
  "mcpServers": {
    "compressbyurl": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "compressbyurl-mcp", "--workspace-root", "/absolute/path/to/project"]
    }
  }
}
```

Claude Desktop uses the same `mcpServers` entry shape. If a host advertises an MCP file
root, the server treats it as an optional additional narrowing constraint; the explicit
startup root remains mandatory for every workspace tool.

## Tools

All input objects are strict, all successful structured outputs use
`schemaVersion: "1"`, and model-visible errors contain stable codes without stack
traces.

| Tool                            | Purpose                                                             | Writes                   | Network                |
| ------------------------------- | ------------------------------------------------------------------- | ------------------------ | ---------------------- |
| `get_server_info`               | Report version, tools, formats, root IDs, and safety posture        | No                       | No                     |
| `audit_webpage_images`          | Measure discoverable static images from one public page             | No                       | Public HTTP/S only     |
| `audit_workspace_images`        | Measure supported images beneath an authorized root                 | No                       | No                     |
| `optimize_image`                | Create one verified replacement from a workspace path or public URL | New file only            | Optional public HTTP/S |
| `apply_image_optimization_plan` | Apply a workspace audit plan and write an exact manifest            | New directory/files only | No                     |

### `audit_webpage_images`

Input: `url` and optional `maxImages` (1–80, default 20). The server discovers inert
HTML sources, fetches candidates through its SSRF boundary, and reports measured
bytes, dimensions, formats, issues, recommendations, failures, and applied limits. It
does not execute JavaScript, render the page, crawl a domain, or claim actual LCP.

### `audit_workspace_images`

Input: optional `rootId`, workspace-relative `directory`, and `maxFiles` (1–1000). The
server reports only workspace-relative paths, exact hashes, duplicates, issues,
skipped reasons, and a deterministic versioned optimization plan. It never follows
symlinks/junctions or writes files.

### `optimize_image`

Input selects one workspace path or public URL, a new workspace-relative destination,
JPEG/PNG/WebP/AVIF output, and either:

- `mode: "quality"` with `quality` 1–100; or
- `mode: "target"` with `targetBytes` and optional `smartFit`.

Dimension limits require `smartFit: true`. Converting transparency to JPEG requires an
explicit six-digit `jpegBackground`. The result includes measured source/output facts,
hashes, target truthfulness, applied settings, encoder version, and warnings. Metadata
is stripped, orientation is normalized, and existing destinations are never replaced.

### `apply_image_optimization_plan`

Input contains the complete plan returned by `audit_workspace_images` plus its new
`outputDirectory`. The server recomputes the plan ID, revalidates every source hash and
destination, applies at most two items concurrently, isolates failures, and writes
`replacement-manifest.json`. The directory must not exist; repeating a plan never
silently overwrites outputs.

## Read-only policy check

Add `.compressbyurlrc.json` to a project:

```json
{
  "schemaVersion": "1",
  "budgets": { "maxBytes": 500000, "maxWidth": 2560, "maxHeight": 2560 },
  "rules": [
    {
      "pattern": "public/hero/**",
      "budgets": { "maxBytes": 250000, "maxWidth": 1920 }
    }
  ]
}
```

Run the check in human or JSON mode:

```sh
npx --no-install compressbyurl-mcp check --root . --directory public
npx --no-install compressbyurl-mcp check --root . --directory public --json
```

Rules are ordered workspace-relative globs using `*`, `?`, and whole-segment `**`.
Later matching rules override only the fields they declare. The command uses the same
workspace audit implementation as MCP, makes no network requests, and performs no
writes.

| Exit | Meaning                                          |
| ---- | ------------------------------------------------ |
| 0    | Complete audit; all budgets passed               |
| 1    | Complete audit; one or more budgets failed       |
| 2    | Invalid arguments/policy or incomplete execution |

## Security and privacy

- URL fetching validates every redirect and pins validated DNS addresses.
- Loopback, private, link-local, and metadata destinations are denied by default.
- Byte, redirect, time, decoded-pixel, file-count, directory-depth, and concurrency
  limits are always enforced.
- Workspace access requires a real, existing server-approved root. A client root,
  when available, can only narrow it.
- Traversal, absolute tool paths, symlinks, junctions, device names, changed files,
  animation, signature spoofing, and destination races are rejected.
- Writes use exclusive same-directory temporary files and atomic hard-link commits.
- Source files and existing destinations are never overwritten.
- stdout is reserved for MCP protocol JSON; diagnostics go to stderr.

See [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## Troubleshooting

### Host cannot find `npx`

GUI hosts may inherit a smaller `PATH` than your terminal. Confirm `node --version` is
at least 22.19 and `npx --version` works, restart the host, or set `command` to the
absolute `npx` executable (`npx.cmd` on some Windows hosts). Do not put shell quoting
inside an `args` array.

### Sharp fails to load

Do not copy `node_modules` between operating systems or CPU architectures. Remove the
consumer install and reinstall the package on the target machine with a supported Node
version. Corporate proxies must allow npm to install Sharp's platform package. Run the
clean install again before reporting a codec failure.

### Server starts but tools are missing

Inspect host logs for stderr, increase the startup timeout, and make sure no shell
wrapper prints banners to stdout. Validate directly with:

```sh
npx -y @modelcontextprotocol/inspector --cli npx -y compressbyurl-mcp --method tools/list --strict
```

### Workspace tools return `WORKSPACE_ROOT_REQUIRED`

Supply `--workspace-root` with an absolute existing directory. If multiple roots are
configured, pass one opaque `rootId` returned by `get_server_info`. If the host exposes
a client root, open a folder that overlaps the configured server root.

### A target cannot be reached

`target.met` is intentionally truthful. The server returns the best bounded candidate
and `TARGET_UNREACHABLE`; enable `smartFit` only when reducing dimensions is acceptable.

## Development and verification

From the repository root:

```sh
npm ci
npm run mcp:verify
npm run mcp:release-check
```

Release verification includes contracts, security/containment tests, all four codecs,
raw and rooted stdio clients, policy CLI exits, package construction, a clean external
install, direct protocol invocation from that install, and an ephemeral one-command
`npm exec`/`npx` launch from the packed tarball.

## Versioning and release policy

The package follows [Semantic Versioning](https://semver.org/). During 0.x alpha:

- patch releases fix behavior without intentionally changing schema meaning;
- minor releases may add tools or optional fields and will document migrations; and
- breaking tool/schema/CLI changes require a new package minor while below 1.0, then a
  package major at or above 1.0.

The independent `schemaVersion` changes whenever consumers must interpret a result or
policy differently. See [CHANGELOG.md](CHANGELOG.md) for shipped changes.

## License

MIT © CompressByURL contributors.
