import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const expectedTag = `v${packageJson.version}`;
const releaseTag = process.env.RELEASE_TAG;

assert.equal(
  releaseTag,
  expectedTag,
  `Release tag ${releaseTag ?? "<missing>"} must exactly match ${expectedTag}.`,
);
assert.equal(packageJson.name, "compressbyurl-mcp");
assert.equal(packageJson.private, false);
assert.equal(packageJson.publishConfig?.access, "public");
console.log(`release version verified: ${packageJson.name}@${packageJson.version}`);
