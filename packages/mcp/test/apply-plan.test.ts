import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import sharp from "sharp";

import {
  applyOptimizationPlanOutputSchema,
  type ApplyOptimizationPlanInput,
} from "../src/apply-plan-contracts.js";
import { applyImageOptimizationPlan, ApplyPlanError } from "../src/apply-plan.js";
import { auditWorkspaceImages } from "../src/workspace-audit.js";
import { createOptimizationPlanId, WorkspaceAuditError } from "../src/workspace-audit.js";

async function temporaryDirectory(t: TestContext) {
  const directory = await mkdtemp(path.join(tmpdir(), "compressbyurl-plan-"));
  t.after(async () => rm(directory, { recursive: true, force: true }));
  return directory;
}

function configuration(root: string, signal?: AbortSignal) {
  return {
    addressPolicy: "public-only" as const,
    approvedRoots: [root],
    clientRoots: [root],
    ...(signal ? { signal } : {}),
  };
}

async function fixturePng(color: { r: number; g: number; b: number }) {
  return sharp({
    create: {
      width: 48,
      height: 36,
      channels: 3,
      background: color,
    },
  })
    .png()
    .toBuffer();
}

async function auditPlan(root: string) {
  const audit = await auditWorkspaceImages(
    { directory: ".", maxFiles: 20 },
    { approvedRoots: [root], clientRoots: [root] },
  );
  return audit.plan;
}

test("applies an audit plan and writes an exact exclusive manifest", async (t) => {
  const root = await temporaryDirectory(t);
  const source = await fixturePng({ r: 20, g: 60, b: 100 });
  await writeFile(path.join(root, "source.png"), source);
  const plan = await auditPlan(root);
  assert.equal(plan.items.length, 1);

  const output = await applyImageOptimizationPlan(
    { plan, outputDirectory: "compressbyurl-output" },
    configuration(root),
  );
  assert.equal(applyOptimizationPlanOutputSchema.safeParse(output).success, true);
  assert.deepEqual(output.summary, {
    requested: 1,
    succeeded: 1,
    failed: 0,
    cancelled: 0,
    originalBytes: source.byteLength,
    optimizedBytes: output.results[0]?.optimization?.optimized.bytes,
    savedBytes: Math.max(
      0,
      source.byteLength - (output.results[0]?.optimization?.optimized.bytes ?? 0),
    ),
  });
  const manifest = JSON.parse(
    await readFile(path.join(root, output.manifestPath), "utf8"),
  );
  assert.deepEqual(manifest, output);
  assert.deepEqual(await readFile(path.join(root, "source.png")), source);
  assert.deepEqual(
    (await readdir(path.join(root, "compressbyurl-output"))).sort(),
    [path.basename(plan.items[0]?.destination ?? ""), "replacement-manifest.json"].sort(),
  );
  assert.equal(
    (await readdir(path.join(root, "compressbyurl-output"))).some((name) =>
      name.includes(".compressbyurl-"),
    ),
    false,
  );

  const before = await readFile(path.join(root, plan.items[0]?.destination ?? ""));
  await assert.rejects(
    applyImageOptimizationPlan(
      { plan, outputDirectory: "compressbyurl-output" },
      configuration(root),
    ),
    (error) => error instanceof ApplyPlanError && error.code === "DESTINATION_EXISTS",
  );
  assert.deepEqual(
    await readFile(path.join(root, plan.items[0]?.destination ?? "")),
    before,
  );
});

test("isolates changed-source failures while preserving successful outputs", async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(path.join(root, "a.png"), await fixturePng({ r: 1, g: 2, b: 3 }));
  await writeFile(path.join(root, "b.png"), await fixturePng({ r: 4, g: 5, b: 6 }));
  const plan = await auditPlan(root);
  assert.equal(plan.items.length, 2);
  await writeFile(path.join(root, "b.png"), await fixturePng({ r: 7, g: 8, b: 9 }));

  const output = await applyImageOptimizationPlan(
    { plan, outputDirectory: "compressbyurl-output" },
    configuration(root),
  );
  assert.equal(output.summary.succeeded, 1);
  assert.equal(output.summary.failed, 1);
  assert.equal(output.results[0]?.status, "succeeded");
  assert.equal(output.results[1]?.status, "failed");
  assert.equal(output.results[1]?.error?.code, "SOURCE_CHANGED");
  assert.equal(existsSync(path.join(root, plan.items[0]?.destination ?? "")), true);
  assert.equal(existsSync(path.join(root, plan.items[1]?.destination ?? "")), false);
  const manifest = JSON.parse(
    await readFile(path.join(root, output.manifestPath), "utf8"),
  );
  assert.deepEqual(manifest.results, output.results);
});

test("rejects altered IDs and destinations outside the dedicated directory", async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(path.join(root, "source.png"), await fixturePng({ r: 1, g: 1, b: 1 }));
  const plan = await auditPlan(root);
  const invalidIdInput: ApplyOptimizationPlanInput = {
    plan: { ...plan, planId: "0".repeat(64) },
    outputDirectory: "compressbyurl-output",
  };
  await assert.rejects(
    applyImageOptimizationPlan(invalidIdInput, configuration(root)),
    (error) => error instanceof ApplyPlanError && error.code === "INVALID_PLAN",
  );
  assert.equal(existsSync(path.join(root, "compressbyurl-output")), false);

  const first = plan.items[0];
  assert.ok(first);
  const items = [{ ...first, destination: "other-output/escaped.webp" }];
  const movedPlan = {
    ...plan,
    items,
    planId: createOptimizationPlanId(plan.rootId, items),
  };
  await assert.rejects(
    applyImageOptimizationPlan(
      { plan: movedPlan, outputDirectory: "compressbyurl-output" },
      configuration(root),
    ),
    (error) => error instanceof ApplyPlanError && error.code === "INVALID_PLAN",
  );
  assert.equal(existsSync(path.join(root, "other-output")), false);
});

test("cancellation before application creates no output or temporary files", async (t) => {
  const root = await temporaryDirectory(t);
  await writeFile(path.join(root, "source.png"), await fixturePng({ r: 5, g: 5, b: 5 }));
  const plan = await auditPlan(root);
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    applyImageOptimizationPlan(
      { plan, outputDirectory: "compressbyurl-output" },
      configuration(root, controller.signal),
    ),
    (error) => error instanceof WorkspaceAuditError && error.code === "CANCELLED",
  );
  assert.deepEqual(await readdir(root), ["source.png"]);
});

test("subdirectory audits keep workspace-relative sources that apply correctly", async (t) => {
  const root = await temporaryDirectory(t);
  await mkdir(path.join(root, "public"));
  await writeFile(
    path.join(root, "public", "source.png"),
    await fixturePng({ r: 30, g: 60, b: 90 }),
  );
  const audit = await auditWorkspaceImages(
    { directory: "public", maxFiles: 20 },
    { approvedRoots: [root], clientRoots: [root] },
  );
  assert.equal(audit.images[0]?.relativePath, "public/source.png");
  assert.equal(audit.plan.items[0]?.source.identifier, "public/source.png");

  const output = await applyImageOptimizationPlan(
    { plan: audit.plan, outputDirectory: "compressbyurl-output" },
    configuration(root),
  );
  assert.equal(output.summary.succeeded, 1);
  assert.equal(existsSync(path.join(root, audit.plan.items[0]?.destination ?? "")), true);
});
