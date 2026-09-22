import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import sharp from "sharp";

const fixtureRoot = await mkdtemp(path.join(tmpdir(), "compressbyurl-check-"));
const policyPath = path.join(fixtureRoot, ".compressbyurlrc.json");
const source = await sharp({
  create: {
    width: 16,
    height: 12,
    channels: 3,
    background: { r: 24, g: 48, b: 96 },
  },
})
  .png()
  .toBuffer();
await writeFile(path.join(fixtureRoot, "fixture.png"), source);

function run(...argumentsToPass) {
  return spawnSync(
    process.execPath,
    ["dist/cli.js", "check", "--root", fixtureRoot, ...argumentsToPass],
    {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
      windowsHide: true,
    },
  );
}

try {
  await writeFile(
    policyPath,
    JSON.stringify({
      schemaVersion: "1",
      budgets: { maxBytes: 1_000_000, maxWidth: 1_000, maxHeight: 1_000 },
    }),
  );
  const passed = run("--json");
  assert.equal(passed.status, 0, passed.stderr);
  assert.equal(passed.stderr, "");
  assert.equal(JSON.parse(passed.stdout).status, "pass");
  assert.equal(passed.stdout.includes(fixtureRoot), false);
  assert.equal(passed.stdout.includes(source.toString("base64")), false);

  await writeFile(
    policyPath,
    JSON.stringify({ schemaVersion: "1", budgets: { maxBytes: 1 } }),
  );
  const failed = run("--json");
  assert.equal(failed.status, 1, failed.stderr);
  assert.equal(failed.stderr, "");
  assert.equal(JSON.parse(failed.stdout).status, "budget-failure");
  assert.equal(failed.stdout.includes(fixtureRoot), false);

  await writeFile(policyPath, "invalid JSON");
  const invalid = run("--json");
  assert.equal(invalid.status, 2, invalid.stderr);
  assert.equal(invalid.stderr, "");
  assert.equal(JSON.parse(invalid.stdout).status, "execution-error");
  assert.equal(invalid.stdout.includes(fixtureRoot), false);

  const help = run("--help");
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /Exit codes:/);
  console.log("check CLI smoke verification passed");
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}
