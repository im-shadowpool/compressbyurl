# Image Budget Policy and CI

`compressbyurl-mcp check` is a local, read-only CI command backed by the same
`auditWorkspaceImages` implementation as the MCP workspace tool. It does not make
network requests, write images, or print private absolute paths or image contents.

## Policy file

The default policy path is `.compressbyurlrc.json` beneath the selected workspace
root. The object is strict: unknown fields, unsupported versions, empty budgets,
unsafe patterns, and out-of-range values are execution errors.

```json
{
  "schemaVersion": "1",
  "budgets": {
    "maxBytes": 500000,
    "maxWidth": 2560,
    "maxHeight": 2560
  },
  "rules": [
    {
      "pattern": "public/hero/**",
      "budgets": {
        "maxBytes": 250000,
        "maxWidth": 1920
      }
    }
  ]
}
```

The complete example is in
[`compressbyurlrc.example.json`](./compressbyurlrc.example.json).

`budgets` must specify at least one of `maxBytes`, `maxWidth`, or `maxHeight`.
`rules` is optional and may contain at most 100 entries. Patterns are
workspace-relative POSIX globs using `*`, `?`, and whole-segment `**`; absolute paths,
backslashes, traversal, braces, and character classes are rejected.

Matching rules are applied in array order. A rule overrides only the budget fields it
declares, so later matching rules win for those fields while undeclared fields retain
their earlier/global values. Findings preserve deterministic audit-path order and the
fixed byte, width, height check order. Rule indexes are zero-based; `null` means the
global budget.

Schema version 1 checks static JPEG, PNG, WebP, and AVIF files. Other known image
formats remain visible as `UNSUPPORTED_FORMAT` audit skips but do not prevent checks of
supported files. Corrupt/inaccessible supported files, containment failures, or a
truncated scan fail closed with exit 2.

## Local commands

From an installed package:

```sh
npx --no-install compressbyurl-mcp check --root . --directory public
npx --no-install compressbyurl-mcp check --root . --directory public --json
```

From this repository:

```sh
npm run mcp:check -- --directory public --json
```

Options:

| Option | Default | Meaning |
| --- | --- | --- |
| `--root <path>` | current directory | Filesystem root authorized for the check |
| `--policy <path>` | `.compressbyurlrc.json` | Policy path relative to the root |
| `--directory <path>` | `.` | Directory to scan, relative to the root |
| `--max-files <1-1000>` | `1000` | Supported-image inspection ceiling |
| `--json` | off | Emit one compact JSON result |
| `--help` | off | Print usage and exit 0 |

JSON pass/failure output embeds the exact schema-valid MCP workspace audit used for
evaluation plus ordered budget findings. It contains numeric measurements and content
hashes, but never raw image bytes, policy contents, environment variables, secrets, or
private absolute paths.

## Stable exit codes

| Exit | Meaning |
| --- | --- |
| `0` | The policy was valid, the audit completed, and every budget passed |
| `1` | The audit completed but at least one budget failed |
| `2` | Arguments/policy were invalid or the audit could not complete safely |

## GitHub Actions guidance

No hosted CompressByURL account is needed. Add the package as a development dependency,
commit the policy, and run the local executable after `npm ci`:

```yaml
name: Image budgets

on:
  pull_request:
  push:

jobs:
  image-budgets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx --no-install compressbyurl-mcp check --root . --directory public --json
```

The command itself requires no network. `npm ci` is the ordinary dependency-install
step and can use the registry/cache policy already chosen by the repository.
