import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import { PublicFetchError } from "@compressbyurl/url-audit-core/network";
import sharp from "sharp";

import { optimizeImageOutputSchema } from "../src/optimize-image-contracts.js";
import { optimizeImage, OptimizeImageError } from "../src/optimize-image.js";
import { WorkspaceAuditError } from "../src/workspace-audit.js";

async function temporaryDirectory(t: TestContext) {
  const directory = await mkdtemp(path.join(tmpdir(), "compressbyurl-optimize-"));
  t.after(async () =>
    rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 }),
  );
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

async function expectOptimizeCode(promise: Promise<unknown>, code: string) {
  await assert.rejects(
    promise,
    (error) =>
      (error instanceof OptimizeImageError || error instanceof WorkspaceAuditError) &&
      error.code === code,
  );
}

test("writes one verified metadata-stripped output without changing its source", async (t) => {
  const root = await temporaryDirectory(t);
  const sourcePath = path.join(root, "source.png");
  const sourceBytes = await sharp({
    create: {
      width: 40,
      height: 30,
      channels: 4,
      background: { r: 20, g: 80, b: 140, alpha: 0.6 },
    },
  })
    .png()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  await writeFile(sourcePath, sourceBytes);

  const output = await optimizeImage(
    {
      source: { type: "workspace", path: "source.png" },
      destination: "optimized.webp",
      format: "webp",
      mode: "quality",
      quality: 82,
      smartFit: false,
    },
    configuration(root),
  );

  assert.equal(optimizeImageOutputSchema.safeParse(output).success, true);
  assert.equal(output.destination, "optimized.webp");
  assert.equal(output.optimized.format, "webp");
  assert.equal(output.optimized.quality, 82);
  assert.deepEqual(await readFile(sourcePath), sourceBytes);
  const written = await readFile(path.join(root, "optimized.webp"));
  const metadata = await sharp(written).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.orientation, undefined);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.hasAlpha, true);
  assert.equal(output.settings.metadataStripped, true);
  assert.equal(output.settings.orientationNormalized, true);
});

test("requires an explicit background for transparent JPEG output", async (t) => {
  const root = await temporaryDirectory(t);
  const source = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.2 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "alpha.png"), source);

  await expectOptimizeCode(
    optimizeImage(
      {
        source: { type: "workspace", path: "alpha.png" },
        destination: "missing-background.jpg",
        format: "jpeg",
        mode: "quality",
        quality: 80,
        smartFit: false,
      },
      configuration(root),
    ),
    "JPEG_BACKGROUND_REQUIRED",
  );
  assert.equal(existsSync(path.join(root, "missing-background.jpg")), false);

  await optimizeImage(
    {
      source: { type: "workspace", path: "alpha.png" },
      destination: "flattened.jpg",
      format: "jpeg",
      mode: "quality",
      quality: 80,
      smartFit: false,
      jpegBackground: "#ffffff",
    },
    configuration(root),
  );
  assert.equal(
    (await sharp(path.join(root, "flattened.jpg")).metadata()).hasAlpha,
    false,
  );
});

test("encodes and verifies every advertised output format", async (t) => {
  const root = await temporaryDirectory(t);
  const source = await sharp({
    create: {
      width: 18,
      height: 14,
      channels: 3,
      background: { r: 80, g: 120, b: 160 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "source.png"), source);
  const outputs = [
    { format: "jpeg" as const, destination: "output.jpg", sharpFormat: "jpeg" },
    { format: "png" as const, destination: "output.png", sharpFormat: "png" },
    { format: "webp" as const, destination: "output.webp", sharpFormat: "webp" },
    { format: "avif" as const, destination: "output.avif", sharpFormat: "heif" },
  ];

  for (const item of outputs) {
    const output = await optimizeImage(
      {
        source: { type: "workspace", path: "source.png" },
        destination: item.destination,
        format: item.format,
        mode: "quality",
        quality: 75,
        smartFit: false,
      },
      configuration(root),
    );
    assert.equal(output.optimized.format, item.format);
    assert.equal(
      (await sharp(await readFile(path.join(root, item.destination))).metadata()).format,
      item.sharpFormat,
    );
  }
});

test("reports target truthfully and reduces dimensions only with smartFit", async (t) => {
  const root = await temporaryDirectory(t);
  const width = 400;
  const height = 300;
  const noisy = await sharp(randomBytes(width * height * 3), {
    raw: { width, height, channels: 3 },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "noisy.png"), noisy);

  const fixed = await optimizeImage(
    {
      source: { type: "workspace", path: "noisy.png" },
      destination: "fixed.webp",
      format: "webp",
      mode: "target",
      targetBytes: 1,
      smartFit: false,
    },
    configuration(root),
  );
  assert.equal(fixed.target.met, false);
  assert.equal(fixed.optimized.width, width);
  assert.equal(fixed.optimized.height, height);
  assert.equal(fixed.settings.attempts <= 12, true);
  assert.equal(
    fixed.warnings.some((warning) => warning.code === "TARGET_UNREACHABLE"),
    true,
  );

  const fitted = await optimizeImage(
    {
      source: { type: "workspace", path: "noisy.png" },
      destination: "fitted.webp",
      format: "webp",
      mode: "target",
      targetBytes: 1_000,
      smartFit: true,
    },
    configuration(root),
  );
  assert.equal(fitted.optimized.width < width, true);
  assert.equal(fitted.optimized.height < height, true);
  assert.equal(fitted.target.met, fitted.optimized.bytes <= 1_000);
  assert.equal(fitted.settings.attempts <= 12, true);
});

test("commits exclusively under concurrent destination races", async (t) => {
  const root = await temporaryDirectory(t);
  const source = await sharp({
    create: {
      width: 24,
      height: 24,
      channels: 3,
      background: { r: 10, g: 20, b: 30 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "race.png"), source);
  const input = {
    source: { type: "workspace" as const, path: "race.png" },
    destination: "race.webp",
    format: "webp" as const,
    mode: "quality" as const,
    quality: 80,
    smartFit: false,
  };

  const results = await Promise.allSettled([
    optimizeImage(input, configuration(root)),
    optimizeImage(input, configuration(root)),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const rejected = results.find((result) => result.status === "rejected");
  assert.equal(
    rejected?.status === "rejected" &&
      rejected.reason instanceof OptimizeImageError &&
      rejected.reason.code === "DESTINATION_EXISTS",
    true,
  );
  assert.equal(
    (await sharp(await readFile(path.join(root, "race.webp"))).metadata()).format,
    "webp",
  );
  assert.equal(
    (await readdir(root)).some((name) => name.includes(".compressbyurl-")),
    false,
  );
});

test("never overwrites existing destinations and rejects path escapes", async (t) => {
  const root = await temporaryDirectory(t);
  const outside = await temporaryDirectory(t);
  const source = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "source.png"), source);
  await writeFile(path.join(root, "existing.webp"), "keep me");
  const baseInput = {
    source: { type: "workspace" as const, path: "source.png" },
    format: "webp" as const,
    mode: "quality" as const,
    quality: 80,
    smartFit: false,
  };

  await expectOptimizeCode(
    optimizeImage({ ...baseInput, destination: "existing.webp" }, configuration(root)),
    "DESTINATION_EXISTS",
  );
  assert.equal(await readFile(path.join(root, "existing.webp"), "utf8"), "keep me");
  await expectOptimizeCode(
    optimizeImage({ ...baseInput, destination: "../escape.webp" }, configuration(root)),
    "PATH_OUTSIDE_ROOT",
  );

  const linkPath = path.join(root, "linked");
  let linkCreated = false;
  try {
    await symlink(outside, linkPath, process.platform === "win32" ? "junction" : "dir");
    linkCreated = true;
  } catch {
    t.diagnostic("Junction creation was unavailable on this host.");
  }
  if (linkCreated) {
    await expectOptimizeCode(
      optimizeImage(
        { ...baseInput, destination: "linked/escape.webp" },
        configuration(root),
      ),
      "PATH_ESCAPE",
    );
  }
});

test("optimizes an explicitly allowed URL and blocks it by default", async (t) => {
  const root = await temporaryDirectory(t);
  const image = await sharp({
    create: {
      width: 12,
      height: 10,
      channels: 3,
      background: { r: 60, g: 100, b: 140 },
    },
  })
    .png()
    .toBuffer();
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "image/png" });
    response.end(image);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  if (!address || typeof address === "string") assert.fail("Missing fixture address");
  const url = `http://127.0.0.1:${address.port}/source.png`;
  const input = {
    source: { type: "url" as const, url },
    destination: "url.webp",
    format: "webp" as const,
    mode: "quality" as const,
    quality: 80,
    smartFit: false,
  };

  await assert.rejects(
    optimizeImage(input, configuration(root)),
    (error) => error instanceof PublicFetchError && error.code === "UNSAFE_DESTINATION",
  );
  assert.equal(existsSync(path.join(root, "url.webp")), false);

  const output = await optimizeImage(input, {
    ...configuration(root),
    addressPolicy: "public-and-loopback",
  });
  assert.equal(output.source.type, "url");
  assert.equal(output.optimized.format, "webp");
});

test("cancellation leaves no destination or temporary file", async (t) => {
  const root = await temporaryDirectory(t);
  const source = await sharp({
    create: {
      width: 8,
      height: 8,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .png()
    .toBuffer();
  await writeFile(path.join(root, "source.png"), source);
  const controller = new AbortController();
  controller.abort();

  await expectOptimizeCode(
    optimizeImage(
      {
        source: { type: "workspace", path: "source.png" },
        destination: "cancelled.webp",
        format: "webp",
        mode: "quality",
        quality: 80,
        smartFit: false,
      },
      configuration(root, controller.signal),
    ),
    "CANCELLED",
  );
  assert.deepEqual(await readdir(root), ["source.png"]);
});
