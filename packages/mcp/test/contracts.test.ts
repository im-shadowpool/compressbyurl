import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { applyOptimizationPlanInputSchema } from "../src/apply-plan-contracts.js";
import {
  createServerInfo,
  emptyInputSchema,
  serverInfoSchema,
} from "../src/contracts.js";
import { SERVER_VERSION } from "../src/constants.js";
import { auditWebpageImagesInputSchema } from "../src/webpage-audit-contracts.js";
import { auditWorkspaceImagesInputSchema } from "../src/workspace-contracts.js";
import { optimizeImageInputSchema } from "../src/optimize-image-contracts.js";

test("server information conforms to the advertised schema", () => {
  const result = serverInfoSchema.safeParse(createServerInfo());

  if (!result.success) assert.fail(result.error.message);
  assert.deepEqual(result.data.capabilities.tools, [
    "get_server_info",
    "audit_webpage_images",
    "audit_workspace_images",
    "optimize_image",
    "apply_image_optimization_plan",
  ]);
  assert.equal(result.data.security.overwriteEnabled, false);
});

test("empty input rejects unknown properties", () => {
  assert.equal(emptyInputSchema.safeParse({ unexpected: true }).success, false);
});

test("webpage audit input applies defaults and rejects unsafe URL shapes", () => {
  assert.deepEqual(
    auditWebpageImagesInputSchema.parse({ url: "https://example.com/page#hero" }),
    { url: "https://example.com/page#hero", maxImages: 20 },
  );
  assert.equal(
    auditWebpageImagesInputSchema.safeParse({ url: "file:///tmp/image.png" }).success,
    false,
  );
  assert.equal(
    auditWebpageImagesInputSchema.safeParse({
      url: "https://user:secret@example.com/",
    }).success,
    false,
  );
  assert.equal(
    auditWebpageImagesInputSchema.safeParse({
      url: "https://example.com/",
      unknown: true,
    }).success,
    false,
  );
});

test("workspace audit input applies bounded defaults and is strict", () => {
  assert.deepEqual(auditWorkspaceImagesInputSchema.parse({}), {
    directory: ".",
    maxFiles: 200,
  });
  assert.equal(
    auditWorkspaceImagesInputSchema.safeParse({ maxFiles: 1_001 }).success,
    false,
  );
  assert.equal(
    auditWorkspaceImagesInputSchema.safeParse({ unexpected: true }).success,
    false,
  );
});

test("optimization input is mode-specific and gates dimension controls", () => {
  const base = {
    source: { type: "workspace", path: "source.png" },
    destination: "output.webp",
    format: "webp",
    mode: "quality",
    quality: 80,
  };
  const parsed = optimizeImageInputSchema.parse(base);
  assert.equal(parsed.smartFit, false);
  assert.equal(
    optimizeImageInputSchema.safeParse({ ...base, maxWidth: 100 }).success,
    false,
  );
  assert.equal(
    optimizeImageInputSchema.safeParse({ ...base, smartFit: true, maxWidth: 100 })
      .success,
    true,
  );
  assert.equal(
    optimizeImageInputSchema.safeParse({ ...base, unknown: true }).success,
    false,
  );
});

test("plan application input accepts only a complete strict audit plan", () => {
  const input = {
    plan: {
      schemaVersion: "1",
      planId: "a".repeat(64),
      rootId: "12345678",
      createdFrom: "workspace",
      items: [],
    },
    outputDirectory: "compressbyurl-output",
  };
  assert.equal(applyOptimizationPlanInputSchema.safeParse(input).success, true);
  assert.equal(
    applyOptimizationPlanInputSchema.safeParse({ ...input, unexpected: true }).success,
    false,
  );
  assert.equal(
    applyOptimizationPlanInputSchema.safeParse({
      ...input,
      plan: { ...input.plan, createdFrom: "webpage" },
    }).success,
    false,
  );
});

test("server version matches package metadata", async () => {
  const packageUrl = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8")) as {
    version?: unknown;
  };

  assert.equal(packageJson.version, SERVER_VERSION);
});

test("public package metadata and documentation match the shipped surface", async () => {
  const packageUrl = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8")) as {
    name?: unknown;
    version?: unknown;
    keywords?: unknown;
    homepage?: unknown;
    bugs?: unknown;
    private?: unknown;
    license?: unknown;
    bin?: unknown;
    main?: unknown;
    types?: unknown;
    exports?: unknown;
    files?: unknown;
    publishConfig?: unknown;
    engines?: unknown;
    dependencies?: Record<string, string>;
    repository?: unknown;
  };
  const [readme, changelog, security, license] = await Promise.all([
    readFile(new URL("../README.md", import.meta.url), "utf8"),
    readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8"),
    readFile(new URL("../SECURITY.md", import.meta.url), "utf8"),
    readFile(new URL("../LICENSE", import.meta.url), "utf8"),
  ]);

  assert.equal(packageJson.name, "compressbyurl-mcp");
  assert.equal(packageJson.version, SERVER_VERSION);
  assert.deepEqual(packageJson.keywords, [
    "mcp",
    "model-context-protocol",
    "image-optimization",
    "web-performance",
    "sharp",
  ]);
  assert.equal(
    packageJson.homepage,
    "https://github.com/im-shadowpool/CompressByURL#readme",
  );
  assert.deepEqual(packageJson.bugs, {
    url: "https://github.com/im-shadowpool/CompressByURL/issues",
  });
  assert.equal(packageJson.private, false);
  assert.equal(packageJson.license, "MIT");
  assert.deepEqual(packageJson.bin, {
    "compressbyurl-mcp": "dist/cli.js",
  });
  assert.equal(packageJson.main, "./dist/server.js");
  assert.equal(packageJson.types, "./dist/server.d.ts");
  assert.deepEqual(packageJson.exports, {
    ".": {
      types: "./dist/server.d.ts",
      import: "./dist/server.js",
    },
  });
  assert.deepEqual(packageJson.files, [
    "dist",
    "README.md",
    "CHANGELOG.md",
    "SECURITY.md",
    "LICENSE",
  ]);
  assert.deepEqual(packageJson.publishConfig, { access: "public" });
  assert.deepEqual(packageJson.engines, { node: ">=22.19.0" });
  assert.deepEqual(packageJson.repository, {
    type: "git",
    url: "git+https://github.com/im-shadowpool/CompressByURL.git",
    directory: "packages/mcp",
  });
  assert.equal(
    Object.hasOwn(packageJson.dependencies ?? {}, "@compressbyurl/url-audit-core"),
    false,
  );

  assert.equal(readme.includes("npx -y compressbyurl-mcp"), true);
  assert.equal(
    readme.includes('import { createMcpServer } from "compressbyurl-mcp";'),
    true,
  );
  assert.equal(readme.includes(`Version ${SERVER_VERSION}`), true);
  for (const toolName of createServerInfo().capabilities.tools) {
    assert.equal(
      readme.includes(`\`${toolName}\``),
      true,
      `README is missing the shipped tool ${toolName}.`,
    );
  }
  assert.equal(changelog.includes(`## [${SERVER_VERSION}] - Unreleased`), true);
  assert.match(security, /private vulnerability reporting/i);
  assert.match(license, /^MIT License/m);
});
