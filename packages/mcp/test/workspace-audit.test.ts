import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  mkdtemp,
  mkdir,
  realpath,
  rm,
  symlink,
  truncate,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import sharp from "sharp";

import { auditWorkspaceImagesOutputSchema } from "../src/workspace-contracts.js";
import {
  auditWorkspaceImages,
  configuredRootId,
  resolveAuthorizedWorkspace,
  WorkspaceAuditError,
} from "../src/workspace-audit.js";

async function temporaryDirectory(t: TestContext) {
  const directory = await mkdtemp(path.join(tmpdir(), "compressbyurl-workspace-"));
  t.after(async () => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function expectWorkspaceCode(promise: Promise<unknown>, code: string) {
  await assert.rejects(
    promise,
    (error) => error instanceof WorkspaceAuditError && error.code === code,
  );
}

test("intersects real server-approved and MCP client roots", async (t) => {
  const approved = await temporaryDirectory(t);
  const client = path.join(approved, "client");
  const unrelated = await temporaryDirectory(t);
  await mkdir(client);

  const result = await resolveAuthorizedWorkspace([approved], [client]);
  assert.equal(result.path, await realpath(client));
  assert.equal(result.rootId, configuredRootId(approved));

  const serverOnly = await resolveAuthorizedWorkspace([approved], []);
  assert.equal(serverOnly.path, await realpath(approved));
  assert.equal(serverOnly.rootId, configuredRootId(approved));

  await expectWorkspaceCode(
    resolveAuthorizedWorkspace([approved], [unrelated]),
    "WORKSPACE_ROOT_REQUIRED",
  );
  await expectWorkspaceCode(
    resolveAuthorizedWorkspace([approved], [path.join(approved, "missing")]),
    "WORKSPACE_ROOT_REQUIRED",
  );
  await expectWorkspaceCode(
    resolveAuthorizedWorkspace([], [client]),
    "WORKSPACE_ROOT_REQUIRED",
  );

  await expectWorkspaceCode(
    resolveAuthorizedWorkspace([approved, unrelated], [client, unrelated]),
    "INVALID_INPUT",
  );
  const selected = await resolveAuthorizedWorkspace(
    [approved, unrelated],
    [client, unrelated],
    configuredRootId(unrelated),
  );
  assert.equal(selected.rootId, configuredRootId(unrelated));
});

test("audits supported files, duplicates, skips, and plans deterministically", async (t) => {
  const root = await temporaryDirectory(t);
  const outside = await temporaryDirectory(t);
  const png = await sharp({
    create: {
      width: 32,
      height: 24,
      channels: 4,
      background: { r: 20, g: 40, b: 60, alpha: 0.5 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "a.png"), png);
  await writeFile(path.join(root, "b.png"), png);
  await writeFile(path.join(root, "spoofed.png"), "not a png");
  await writeFile(
    path.join(root, "partial.png"),
    Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  await writeFile(path.join(root, "animated.webp"), "RIFF0000WEBPANIM");
  const oversizedPath = path.join(root, "oversized.jpg");
  await writeFile(oversizedPath, Uint8Array.from([0xff, 0xd8, 0xff]));
  await truncate(oversizedPath, 25 * 1024 * 1024 + 1);
  await writeFile(path.join(root, "unsupported.gif"), "GIF89a");
  await writeFile(path.join(root, "notes.txt"), "ignored");
  await writeFile(path.join(outside, "outside.png"), png);
  const linkPath = path.join(root, "outside-link");
  try {
    await symlink(outside, linkPath, process.platform === "win32" ? "junction" : "dir");
  } catch {
    t.diagnostic(
      "Junction creation was unavailable; containment still has direct coverage.",
    );
  }

  const configuration = { approvedRoots: [root], clientRoots: [root] };
  const first = await auditWorkspaceImages(
    { directory: ".", maxFiles: 20 },
    configuration,
  );
  const second = await auditWorkspaceImages(
    { directory: ".", maxFiles: 20 },
    configuration,
  );

  assert.equal(auditWorkspaceImagesOutputSchema.safeParse(first).success, true);
  assert.deepEqual(second, first);
  assert.deepEqual(
    first.images.map((image) => image.relativePath),
    ["a.png", "b.png"],
  );
  assert.equal(first.images[1]?.duplicateOf, first.images[0]?.id);
  assert.equal(first.summary.duplicateBytes, png.byteLength);
  assert.equal(first.plan.items.length, 1);
  assert.match(first.plan.items[0]?.destination ?? "", /^compressbyurl-output\//);
  assert.equal(
    first.skipped.some((item) => item.code === "SIGNATURE_MISMATCH"),
    true,
  );
  assert.equal(
    first.skipped.some((item) => item.code === "ANIMATED_IMAGE"),
    true,
  );
  assert.equal(
    first.skipped.some((item) => item.code === "UNSUPPORTED_FORMAT"),
    true,
  );
  assert.equal(
    first.skipped.some((item) => item.code === "DECODE_FAILED"),
    true,
  );
  assert.equal(
    first.skipped.some((item) => item.code === "SOURCE_TOO_LARGE"),
    true,
  );
  if (existsSync(linkPath)) {
    assert.equal(
      first.skipped.some((item) => item.code === "PATH_ESCAPE"),
      true,
    );
  }
  assert.equal(
    first.images.every(
      (image) =>
        !path.isAbsolute(image.relativePath) && !image.relativePath.includes(".."),
    ),
    true,
  );
  assert.equal(
    first.plan.items.every(
      (item) =>
        !path.isAbsolute(item.source.identifier) &&
        !path.isAbsolute(item.destination) &&
        !item.source.identifier.includes("..") &&
        !item.destination.includes(".."),
    ),
    true,
  );
  assert.equal(existsSync(path.join(root, "compressbyurl-output")), false);
});

test("supports the four advertised static image formats at runtime", async (t) => {
  const root = await temporaryDirectory(t);
  const base = sharp({
    create: {
      width: 8,
      height: 6,
      channels: 3,
      background: { r: 100, g: 120, b: 140 },
    },
  });
  await writeFile(path.join(root, "one.jpg"), await base.clone().jpeg().toBuffer());
  await writeFile(path.join(root, "two.png"), await base.clone().png().toBuffer());
  await writeFile(path.join(root, "three.webp"), await base.clone().webp().toBuffer());
  await writeFile(path.join(root, "four.avif"), await base.clone().avif().toBuffer());

  const output = await auditWorkspaceImages(
    { directory: ".", maxFiles: 10 },
    { approvedRoots: [root], clientRoots: [root] },
  );

  assert.deepEqual(
    new Set(output.images.map((image) => image.format)),
    new Set(["jpeg", "png", "webp", "avif"]),
  );
});

test("rejects traversal, absolute paths, reserved names, and unknown roots", async (t) => {
  const root = await temporaryDirectory(t);
  const configuration = { approvedRoots: [root], clientRoots: [root] };

  await expectWorkspaceCode(
    auditWorkspaceImages({ directory: "..", maxFiles: 10 }, configuration),
    "PATH_OUTSIDE_ROOT",
  );
  await expectWorkspaceCode(
    auditWorkspaceImages({ directory: path.resolve(root), maxFiles: 10 }, configuration),
    "PATH_OUTSIDE_ROOT",
  );
  await expectWorkspaceCode(
    auditWorkspaceImages({ directory: "CON", maxFiles: 10 }, configuration),
    "PATH_OUTSIDE_ROOT",
  );
  await expectWorkspaceCode(
    auditWorkspaceImages(
      { rootId: "deadbeef", directory: ".", maxFiles: 10 },
      configuration,
    ),
    "WORKSPACE_ROOT_REQUIRED",
  );
});

test("enforces maxFiles and directory depth", async (t) => {
  const root = await temporaryDirectory(t);
  const png = await sharp({
    create: {
      width: 2,
      height: 2,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "one.png"), png);
  await writeFile(path.join(root, "two.png"), png);
  let deep = root;
  for (let depth = 0; depth < 22; depth += 1) {
    deep = path.join(deep, `d${String(depth).padStart(2, "0")}`);
    await mkdir(deep);
  }
  await writeFile(path.join(deep, "deep.png"), png);

  const output = await auditWorkspaceImages(
    { directory: ".", maxFiles: 1 },
    { approvedRoots: [root], clientRoots: [root] },
  );

  assert.equal(output.limits.truncated, true);
  assert.equal(output.images.length, 1);
  assert.equal(
    output.skipped.some((item) => item.code === "DEPTH_LIMIT"),
    true,
  );
});

test("honors cancellation before reading workspace files", async (t) => {
  const root = await temporaryDirectory(t);
  const controller = new AbortController();
  controller.abort();

  await expectWorkspaceCode(
    auditWorkspaceImages(
      { directory: ".", maxFiles: 10 },
      {
        approvedRoots: [root],
        clientRoots: [root],
        signal: controller.signal,
      },
    ),
    "CANCELLED",
  );
});
