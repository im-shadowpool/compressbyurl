import { spawnSync } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDirectory = resolve(packageRoot, "dist");

if (dirname(distDirectory) !== packageRoot) {
  throw new Error("Refusing to clean an unexpected build directory.");
}

await rm(distDirectory, { recursive: true, force: true });
await mkdir(distDirectory, { recursive: true });

const tsc = spawnSync(
  process.execPath,
  [
    resolve(packageRoot, "../../node_modules/typescript/bin/tsc"),
    "-p",
    resolve(packageRoot, "tsconfig.build.json"),
  ],
  { cwd: packageRoot, stdio: "inherit" },
);
if (tsc.status !== 0) {
  process.exitCode = tsc.status ?? 1;
} else {
  const external = [
    "@modelcontextprotocol/*",
    "cheerio",
    "ipaddr.js",
    "sharp",
    "undici",
    "zod",
    "zod/*",
  ];
  await build({
    entryPoints: [resolve(packageRoot, "src/server.ts")],
    outfile: resolve(distDirectory, "server.js"),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    sourcemap: true,
    external,
    logLevel: "info",
  });
  await build({
    entryPoints: [resolve(packageRoot, "src/cli.ts")],
    outfile: resolve(distDirectory, "cli.js"),
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    sourcemap: true,
    external: ["./server.js", ...external],
    logLevel: "info",
  });

  const publicDeclarations = new Set(["server.d.ts", "server.d.ts.map"]);
  for (const file of await readdir(distDirectory)) {
    if (
      (file.endsWith(".d.ts") || file.endsWith(".d.ts.map")) &&
      !publicDeclarations.has(file)
    ) {
      await rm(resolve(distDirectory, file));
    }
  }
}
