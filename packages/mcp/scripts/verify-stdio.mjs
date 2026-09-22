import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const child = spawn(process.execPath, ["dist/cli.js"], {
  cwd: new URL("..", import.meta.url),
  stdio: ["pipe", "pipe", "pipe"],
  windowsHide: true,
});

let stdoutBuffer = "";
let stderr = "";
const messages = [];
const waiters = new Map();

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
    messages.push(message);
    const waiter = waiters.get(message.id);
    if (waiter) {
      waiters.delete(message.id);
      waiter.resolve(message);
    }
  }
});

child.on("error", fail);

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

function request(id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiters.delete(id);
      reject(new Error(`Timed out waiting for ${method}`));
    }, 5_000);
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
    clientInfo: { name: "compressbyurl-smoke", version: "1.0.0" },
  });
  assert.equal(initialized.error, undefined);
  send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  const listed = await request(2, "tools/list");
  assert.deepEqual(
    listed.result.tools.map((tool) => tool.name),
    [
      "get_server_info",
      "audit_webpage_images",
      "audit_workspace_images",
      "optimize_image",
      "apply_image_optimization_plan",
    ],
  );

  const called = await request(3, "tools/call", {
    name: "get_server_info",
    arguments: {},
  });
  assert.equal(called.result.isError, undefined);
  assert.equal(called.result.structuredContent.name, "compressbyurl-mcp");

  const rejected = await request(4, "tools/call", {
    name: "get_server_info",
    arguments: { unexpected: true },
  });
  assert.equal(rejected.result.isError, true);
  assert.match(rejected.result.content[0].text, /Unrecognized key/);

  const blocked = await request(5, "tools/call", {
    name: "audit_webpage_images",
    arguments: { url: "http://127.0.0.1/", maxImages: 1 },
  });
  assert.equal(blocked.result.isError, true);
  assert.match(blocked.result.content[0].text, /UNSAFE_DESTINATION/);

  const workspaceBlocked = await request(6, "tools/call", {
    name: "audit_workspace_images",
    arguments: {},
  });
  assert.equal(workspaceBlocked.result.isError, true);
  assert.match(workspaceBlocked.result.content[0].text, /WORKSPACE_ROOT_REQUIRED/);

  const optimizeBlocked = await request(7, "tools/call", {
    name: "optimize_image",
    arguments: {
      source: { type: "workspace", path: "source.png" },
      destination: "optimized.webp",
      format: "webp",
      mode: "quality",
      quality: 80,
    },
  });
  assert.equal(optimizeBlocked.result.isError, true);
  assert.match(optimizeBlocked.result.content[0].text, /WORKSPACE_ROOT_REQUIRED/);

  const planBlocked = await request(8, "tools/call", {
    name: "apply_image_optimization_plan",
    arguments: {
      plan: {
        schemaVersion: "1",
        planId: "0".repeat(64),
        rootId: "12345678",
        createdFrom: "workspace",
        items: [],
      },
      outputDirectory: "compressbyurl-output",
    },
  });
  assert.equal(planBlocked.result.isError, true);
  assert.match(planBlocked.result.content[0].text, /WORKSPACE_ROOT_REQUIRED/);

  assert.equal(stdoutBuffer.trim(), "");
  assert.match(stderr, /running on stdio/);
  assert.equal(messages.length, 8);
  console.log("stdio smoke verification passed");
} finally {
  child.stdin.end();
  child.kill();
}
