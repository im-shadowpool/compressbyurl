import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import sharp from "sharp";

const fixtureRoot = await mkdtemp(path.join(tmpdir(), "compressbyurl-mcp-root-"));
const image = await sharp({
  create: {
    width: 16,
    height: 12,
    channels: 3,
    background: { r: 24, g: 48, b: 96 },
  },
})
  .jpeg()
  .toBuffer();
await writeFile(path.join(fixtureRoot, "fixture.jpg"), image);

const child = spawn(process.execPath, ["dist/cli.js", "--workspace-root", fixtureRoot], {
  cwd: new URL("..", import.meta.url),
  stdio: ["pipe", "pipe", "pipe"],
  windowsHide: true,
});

let stdoutBuffer = "";
let stderr = "";
const waiters = new Map();

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function fail(error) {
  for (const waiter of waiters.values()) waiter.reject(error);
  waiters.clear();
  child.kill();
}

child.stderr.setEncoding("utf8");
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});

child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk;
  while (stdoutBuffer.includes("\n")) {
    const newline = stdoutBuffer.indexOf("\n");
    const line = stdoutBuffer.slice(0, newline).trim();
    stdoutBuffer = stdoutBuffer.slice(newline + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      fail(new Error(`Non-JSON stdout from MCP server: ${line}`));
      return;
    }
    const waiter = waiters.get(message.id);
    if (waiter) {
      waiters.delete(message.id);
      waiter.resolve(message);
    }
  }
});
child.on("error", fail);

function request(id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiters.delete(id);
      reject(new Error(`Timed out waiting for ${method}`));
    }, 10_000);
    waiters.set(id, {
      resolve(value) {
        clearTimeout(timer);
        resolve(value);
      },
      reject(error) {
        clearTimeout(timer);
        reject(error);
      },
    });
    send({ jsonrpc: "2.0", id, method, params });
  });
}

try {
  const initialized = await request(1, "initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "compressbyurl-workspace-smoke", version: "1.0.0" },
  });
  assert.equal(initialized.error, undefined);
  send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  const audited = await request(2, "tools/call", {
    name: "audit_workspace_images",
    arguments: { directory: ".", maxFiles: 10 },
  });
  assert.equal(audited.result.isError, undefined);
  assert.equal(audited.result.structuredContent.summary.filesReported, 1);
  assert.equal(audited.result.structuredContent.images[0].relativePath, "fixture.jpg");
  assert.equal(
    path.isAbsolute(audited.result.structuredContent.images[0].relativePath),
    false,
  );

  const optimized = await request(3, "tools/call", {
    name: "optimize_image",
    arguments: {
      source: { type: "workspace", path: "fixture.jpg" },
      destination: "fixture.optimized.webp",
      format: "webp",
      mode: "quality",
      quality: 80,
    },
  });
  assert.equal(optimized.result.isError, undefined);
  assert.equal(optimized.result.structuredContent.optimized.format, "webp");
  assert.equal(optimized.result.structuredContent.destination, "fixture.optimized.webp");
  assert.equal(
    (await stat(path.join(fixtureRoot, "fixture.optimized.webp"))).isFile(),
    true,
  );

  const applied = await request(4, "tools/call", {
    name: "apply_image_optimization_plan",
    arguments: {
      plan: audited.result.structuredContent.plan,
      outputDirectory: "compressbyurl-output",
    },
  });
  assert.equal(applied.result.isError, undefined);
  assert.equal(applied.result.structuredContent.summary.requested, 1);
  assert.equal(applied.result.structuredContent.summary.succeeded, 1);
  assert.equal(applied.result.structuredContent.summary.failed, 0);
  assert.equal(
    (
      await stat(path.join(fixtureRoot, applied.result.structuredContent.manifestPath))
    ).isFile(),
    true,
  );
  assert.equal(stdoutBuffer.trim(), "");
  assert.match(stderr, /running on stdio/);
  console.log("workspace stdio smoke verification passed");
} finally {
  child.stdin.end();
  child.kill();
  await rm(fixtureRoot, { recursive: true, force: true });
}
