import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "compressbyurl-packed-"));
const archiveDirectory = path.join(temporaryRoot, "archive");
const consumerDirectory = path.join(temporaryRoot, "consumer");
const npxDirectory = path.join(temporaryRoot, "npx-consumer");
const workspaceDirectory = path.join(temporaryRoot, "workspace");

function run(command, argumentsToPass, options = {}) {
  const result = spawnSync(command, argumentsToPass, {
    encoding: "utf8",
    windowsHide: true,
    ...options,
  });
  assert.equal(
    result.status,
    0,
    `${command} ${argumentsToPass.join(" ")} failed:\n${result.stdout}\n${result.stderr}`,
  );
  return result;
}

function runNpm(argumentsToPass, options = {}) {
  const npmExecutable = process.env.npm_execpath;
  return npmExecutable
    ? run(process.execPath, [npmExecutable, ...argumentsToPass], options)
    : run("npm", argumentsToPass, options);
}

function npmInvocation(argumentsToPass) {
  const npmExecutable = process.env.npm_execpath;
  return npmExecutable
    ? { command: process.execPath, argumentsToPass: [npmExecutable, ...argumentsToPass] }
    : { command: process.platform === "win32" ? "npm.cmd" : "npm", argumentsToPass };
}

async function verifyProtocol(command, argumentsToPass, cwd) {
  const child = spawn(command, argumentsToPass, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });
  let stdoutBuffer = "";
  let stderr = "";
  const waiters = new Map();
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
      const message = JSON.parse(line);
      const waiter = waiters.get(message.id);
      if (waiter) {
        waiters.delete(message.id);
        waiter.resolve(message);
      }
    }
  });
  function request(id, method, params = {}) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        waiters.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, 30_000);
      waiters.set(id, {
        resolve(value) {
          clearTimeout(timer);
          resolve(value);
        },
      });
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
    });
  }
  try {
    const initialized = await request(1, "initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "clean-consumer", version: "1.0.0" },
    });
    assert.equal(initialized.error, undefined);
    child.stdin.write(
      `${JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} })}\n`,
    );
    const tools = await request(2, "tools/list");
    assert.deepEqual(
      tools.result.tools.map((tool) => tool.name),
      [
        "get_server_info",
        "audit_webpage_images",
        "audit_workspace_images",
        "optimize_image",
        "apply_image_optimization_plan",
      ],
    );
    assert.equal(stdoutBuffer.trim(), "");
    assert.match(stderr, /running on stdio/);
  } finally {
    child.stdin.end();
    child.kill();
  }
}

try {
  await Promise.all([
    mkdir(archiveDirectory, { recursive: true }),
    mkdir(consumerDirectory, { recursive: true }),
    mkdir(npxDirectory, { recursive: true }),
    mkdir(workspaceDirectory, { recursive: true }),
  ]);
  runNpm(["pack", packageRoot, "--pack-destination", archiveDirectory, "--json"]);
  const archives = (await readdir(archiveDirectory)).filter((name) =>
    name.endsWith(".tgz"),
  );
  assert.equal(archives.length, 1);
  const archive = path.join(archiveDirectory, archives[0]);

  const npxHelp = runNpm(
    ["exec", "--yes", "--package", archive, "--", "compressbyurl-mcp", "check", "--help"],
    { cwd: npxDirectory },
  );
  assert.match(npxHelp.stdout, /Exit codes:/);
  const npxServer = npmInvocation([
    "exec",
    "--yes",
    "--package",
    archive,
    "--",
    "compressbyurl-mcp",
  ]);
  await verifyProtocol(npxServer.command, npxServer.argumentsToPass, npxDirectory);

  await writeFile(
    path.join(consumerDirectory, "package.json"),
    JSON.stringify({ name: "clean-consumer", private: true, type: "module" }),
  );
  runNpm(["install", archive, "--no-audit", "--no-fund"], {
    cwd: consumerDirectory,
  });
  const executable = path.join(
    consumerDirectory,
    "node_modules",
    "compressbyurl-mcp",
    "dist",
    "cli.js",
  );
  assert.match(await readFile(executable, "utf8"), /^#!\/usr\/bin\/env node\r?\n/);
  const imported = run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      "import('compressbyurl-mcp').then(({ createMcpServer }) => console.log(typeof createMcpServer))",
    ],
    { cwd: consumerDirectory },
  );
  assert.equal(imported.stdout.trim(), "function");
  assert.equal(imported.stderr, "");
  const help = runNpm(["exec", "--", "compressbyurl-mcp", "check", "--help"], {
    cwd: consumerDirectory,
  });
  assert.match(help.stdout, /Exit codes:/);

  const image = await sharp({
    create: {
      width: 10,
      height: 8,
      channels: 3,
      background: { r: 20, g: 40, b: 60 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(workspaceDirectory, "fixture.png"), image);
  await writeFile(
    path.join(workspaceDirectory, ".compressbyurlrc.json"),
    JSON.stringify({ schemaVersion: "1", budgets: { maxBytes: 1_000_000 } }),
  );
  const checked = run(
    process.execPath,
    [executable, "check", "--root", workspaceDirectory, "--json"],
    { cwd: consumerDirectory },
  );
  assert.equal(JSON.parse(checked.stdout).status, "pass");
  assert.equal(checked.stdout.includes(workspaceDirectory), false);
  await verifyProtocol(process.execPath, [executable], consumerDirectory);
  console.log("clean packed-install verification passed");
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
