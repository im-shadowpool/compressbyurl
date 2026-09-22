import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import sharp from "sharp";

import {
  CHECK_EXIT_BUDGET_FAILURE,
  CHECK_EXIT_EXECUTION_ERROR,
  CHECK_EXIT_PASS,
  parseCheckArguments,
  runCheckCommand,
} from "../src/check-cli.js";
import { imageBudgetPolicySchema } from "../src/policy-contracts.js";
import {
  checkWorkspaceImagePolicy,
  evaluateImageBudgetPolicy,
  policyPatternMatches,
  PolicyCheckError,
} from "../src/policy-check.js";
import { auditWorkspaceImages } from "../src/workspace-audit.js";
import type { WorkspaceImage } from "../src/workspace-contracts.js";

async function temporaryDirectory(t: TestContext) {
  const directory = await mkdtemp(path.join(tmpdir(), "compressbyurl-policy-"));
  t.after(async () => rm(directory, { recursive: true, force: true }));
  return directory;
}

function image(
  relativePath: string,
  values: { bytes: number; width: number; height: number },
): WorkspaceImage {
  return {
    id: `image-${relativePath}`,
    relativePath,
    ...values,
    format: "png",
    contentType: "image/png",
    sha256: "a".repeat(64),
    duplicateOf: null,
    issues: [],
    proposal: null,
  };
}

async function fixturePng() {
  return sharp({
    create: {
      width: 12,
      height: 8,
      channels: 3,
      background: { r: 10, g: 20, b: 30 },
    },
  })
    .png()
    .toBuffer();
}

test("policy schema is strict, versioned, and requires real budgets", () => {
  const valid = {
    schemaVersion: "1",
    budgets: { maxBytes: 100_000 },
    rules: [{ pattern: "public/hero/**", budgets: { maxWidth: 2_000 } }],
  };
  assert.equal(imageBudgetPolicySchema.safeParse(valid).success, true);
  assert.equal(
    imageBudgetPolicySchema.safeParse({ ...valid, schemaVersion: "2" }).success,
    false,
  );
  assert.equal(
    imageBudgetPolicySchema.safeParse({ ...valid, unexpected: true }).success,
    false,
  );
  assert.equal(
    imageBudgetPolicySchema.safeParse({ ...valid, budgets: {} }).success,
    false,
  );
  assert.equal(
    imageBudgetPolicySchema.safeParse({
      ...valid,
      rules: [{ pattern: "../private/**", budgets: { maxWidth: 1 } }],
    }).success,
    false,
  );
});

test("portable path globs support deterministic *, ?, and ** matching", () => {
  assert.equal(policyPatternMatches("public/**", "public/images/hero.png"), true);
  assert.equal(policyPatternMatches("public/*.png", "public/hero.png"), true);
  assert.equal(policyPatternMatches("public/*.png", "public/images/hero.png"), false);
  assert.equal(policyPatternMatches("**/hero-?.png", "public/hero-a.png"), true);
  assert.equal(policyPatternMatches("**/hero-?.png", "hero-long.png"), false);
});

test("path rules override only their declared global budgets in order", () => {
  const policy = imageBudgetPolicySchema.parse({
    schemaVersion: "1",
    budgets: { maxBytes: 100, maxWidth: 200, maxHeight: 100 },
    rules: [
      { pattern: "assets/**", budgets: { maxBytes: 200 } },
      { pattern: "assets/hero-?.png", budgets: { maxWidth: 50 } },
    ],
  });
  const findings = evaluateImageBudgetPolicy(policy, [
    image("assets/hero-a.png", { bytes: 150, width: 80, height: 90 }),
    image("other.png", { bytes: 101, width: 100, height: 101 }),
  ]);
  assert.deepEqual(
    findings.map(({ relativePath, code, ruleIndex }) => ({
      relativePath,
      code,
      ruleIndex,
    })),
    [
      { relativePath: "assets/hero-a.png", code: "MAX_WIDTH", ruleIndex: 1 },
      { relativePath: "other.png", code: "MAX_BYTES", ruleIndex: null },
      { relativePath: "other.png", code: "MAX_HEIGHT", ruleIndex: null },
    ],
  );
});

test("CLI check embeds the exact MCP workspace audit without private paths", async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(path.join(root, "image.png"), await fixturePng());
  const policy = imageBudgetPolicySchema.parse({
    schemaVersion: "1",
    budgets: { maxBytes: 1_000_000, maxWidth: 1_000, maxHeight: 1_000 },
  });
  const direct = await auditWorkspaceImages(
    { directory: ".", maxFiles: 100 },
    { approvedRoots: [root], clientRoots: [root] },
  );
  const checked = await checkWorkspaceImagePolicy({
    root,
    directory: ".",
    maxFiles: 100,
    policy,
  });
  assert.equal(checked.status, "pass");
  assert.deepEqual(checked.audit, direct);
  assert.equal(JSON.stringify(checked).includes(root), false);
});

test("incomplete scans fail closed", async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(path.join(root, "corrupt.png"), "not an image");
  const policy = imageBudgetPolicySchema.parse({
    schemaVersion: "1",
    budgets: { maxBytes: 1_000_000 },
  });
  await assert.rejects(
    checkWorkspaceImagePolicy({
      root,
      directory: ".",
      maxFiles: 100,
      policy,
    }),
    (error) => error instanceof PolicyCheckError && error.code === "AUDIT_INCOMPLETE",
  );
});

test("unsupported formats remain visible but do not hide supported-image checks", async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(path.join(root, "image.png"), await fixturePng());
  await writeFile(path.join(root, "vector.svg"), "<svg></svg>");
  const policy = imageBudgetPolicySchema.parse({
    schemaVersion: "1",
    budgets: { maxBytes: 1_000_000 },
  });
  const checked = await checkWorkspaceImagePolicy({
    root,
    directory: ".",
    maxFiles: 100,
    policy,
  });
  assert.equal(checked.status, "pass");
  assert.equal(checked.summary.filesChecked, 1);
  assert.equal(
    checked.audit.skipped.some((item) => item.code === "UNSUPPORTED_FORMAT"),
    true,
  );
});

test("check command returns stable pass, budget, and execution exit codes", async (t) => {
  const root = await temporaryDirectory(t);
  const source = await fixturePng();
  await writeFile(path.join(root, "image.png"), source);
  const policyPath = path.join(root, ".compressbyurlrc.json");
  await writeFile(
    policyPath,
    JSON.stringify({ schemaVersion: "1", budgets: { maxBytes: 1_000_000 } }),
  );
  const output: string[] = [];
  const errors: string[] = [];
  const io = {
    currentDirectory: root,
    writeOut: (value: string) => output.push(value),
    writeError: (value: string) => errors.push(value),
  };
  assert.equal(await runCheckCommand(["--json"], io), CHECK_EXIT_PASS);
  const passed = JSON.parse(output.pop() ?? "null");
  assert.equal(passed.status, "pass");
  assert.equal(JSON.stringify(passed).includes(root), false);
  assert.equal(JSON.stringify(passed).includes(source.toString("base64")), false);

  await writeFile(
    policyPath,
    JSON.stringify({ schemaVersion: "1", budgets: { maxBytes: 1 } }),
  );
  assert.equal(await runCheckCommand(["--json"], io), CHECK_EXIT_BUDGET_FAILURE);
  assert.equal(JSON.parse(output.pop() ?? "null").status, "budget-failure");

  await writeFile(policyPath, "not json");
  assert.equal(await runCheckCommand(["--json"], io), CHECK_EXIT_EXECUTION_ERROR);
  assert.equal(JSON.parse(output.pop() ?? "null").status, "execution-error");
  assert.deepEqual(errors, []);
  assert.deepEqual((await readdir(root)).sort(), [".compressbyurlrc.json", "image.png"]);
});

test("check argument parser rejects ambiguous and unbounded options", () => {
  assert.equal(parseCheckArguments([], "C:\\workspace").maxFiles, 1_000);
  assert.throws(() => parseCheckArguments(["--max-files", "0"]));
  assert.throws(() => parseCheckArguments(["--json", "--json"]));
  assert.throws(() => parseCheckArguments(["--unknown"]));
});
