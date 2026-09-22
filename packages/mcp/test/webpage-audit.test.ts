import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchPublicResource,
  PublicFetchError,
} from "@compressbyurl/url-audit-core/network";
import sharp from "sharp";

import { auditWebpageImagesOutputSchema } from "../src/webpage-audit-contracts.js";
import { auditWebpageImages } from "../src/webpage-audit.js";

const pageUrl = "https://audit.example/page";
const pageHtml = `<title>Image audit fixture</title>
  <link rel="preload" as="image" href="/hero.jpg">
  <img src="/hero.jpg" width="100" height="80" alt="Hero">
  <img src="http://169.254.169.254/metadata.png">`;
const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);

const fetchResource: typeof fetchPublicResource = async (url, options) => {
  if (url === pageUrl) {
    return {
      bytes: new TextEncoder().encode(pageHtml),
      contentType: "text/html",
      finalUrl: pageUrl,
    };
  }
  assert.equal(options.addressPolicy, "public-only");
  if (url === "https://audit.example/hero.jpg") {
    return {
      bytes: jpeg,
      contentType: "image/jpeg",
      finalUrl: "https://cdn.example/hero.jpg",
    };
  }
  throw new PublicFetchError(
    "UNSAFE_DESTINATION",
    "Private, local, reserved and metadata destinations are blocked.",
  );
};

test("returns deterministic measured and partial webpage audit results", async () => {
  const output = await auditWebpageImages(
    { url: pageUrl, maxImages: 20 },
    { addressPolicy: "public-and-loopback" },
    {
      fetchResource,
      readImageMetadata: async () => ({ width: 200, height: 160 }),
    },
  );

  assert.equal(auditWebpageImagesOutputSchema.safeParse(output).success, true);
  assert.deepEqual(output.summary, {
    totalFound: 2,
    reportedCount: 2,
    measuredCount: 1,
    failedCount: 1,
    knownBytes: 4,
    potentialSavingsBytes: 1,
  });
  assert.deepEqual(output.images[0]?.sources, ["image", "preload"]);
  assert.equal(output.images[0]?.status, "measured");
  assert.equal(output.images[0]?.finalUrl, "https://cdn.example/hero.jpg");
  assert.deepEqual(output.images[0]?.issues, [
    "MODERN_FORMAT_OPPORTUNITY",
    "OVERSIZED_FOR_LAYOUT",
  ]);
  assert.equal(output.images[1]?.status, "unavailable");
  assert.equal(output.images[1]?.error?.code, "UNSAFE_DESTINATION");
  assert.deepEqual(
    output.warnings.map((warning) => warning.code),
    ["PARTIAL_RESULTS"],
  );
  assert.equal("lcp" in output.page, false);
});

test("reports maxImages and truncation truthfully", async () => {
  const output = await auditWebpageImages(
    { url: pageUrl, maxImages: 1 },
    { addressPolicy: "public-only" },
    {
      fetchResource,
      readImageMetadata: async () => ({ width: 100, height: 80 }),
    },
  );

  assert.equal(output.summary.totalFound, 2);
  assert.equal(output.summary.reportedCount, 1);
  assert.equal(output.limits.maxImages, 1);
  assert.equal(output.limits.truncated, true);
  assert.equal(output.warnings[0]?.code, "CANDIDATES_TRUNCATED");
});

test("measures dimensions through the shipped Sharp runtime", async () => {
  const imageBytes = new Uint8Array(
    await sharp({
      create: {
        width: 12,
        height: 8,
        channels: 3,
        background: { r: 40, g: 80, b: 120 },
      },
    })
      .png()
      .toBuffer(),
  );
  const fetchWithPng: typeof fetchPublicResource = async (url) =>
    url === pageUrl
      ? {
          bytes: new TextEncoder().encode('<img src="/measured.png">'),
          contentType: "text/html",
          finalUrl: pageUrl,
        }
      : {
          bytes: imageBytes,
          contentType: "image/png",
          finalUrl: url,
        };

  const output = await auditWebpageImages(
    { url: pageUrl, maxImages: 1 },
    { addressPolicy: "public-only" },
    { fetchResource: fetchWithPng },
  );

  assert.equal(output.images[0]?.width, 12);
  assert.equal(output.images[0]?.height, 8);
  assert.equal(output.images[0]?.format, "png");
});

test("enforces total byte budget and bounded concurrency", async () => {
  const imageBytes = new Uint8Array(8 * 1024 * 1024);
  imageBytes.set([0xff, 0xd8, 0xff]);
  const html = Array.from(
    { length: 9 },
    (_, index) => `<img src="/large-${index}.jpg">`,
  ).join("");
  let active = 0;
  let peakActive = 0;
  const budgetFetch: typeof fetchPublicResource = async (url) => {
    if (url === pageUrl) {
      return {
        bytes: new TextEncoder().encode(html),
        contentType: "text/html",
        finalUrl: pageUrl,
      };
    }
    active += 1;
    peakActive = Math.max(peakActive, active);
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return { bytes: imageBytes, contentType: "image/jpeg", finalUrl: url };
  };

  const output = await auditWebpageImages(
    { url: pageUrl, maxImages: 9 },
    { addressPolicy: "public-only" },
    {
      fetchResource: budgetFetch,
      readImageMetadata: async () => ({ width: 100, height: 100 }),
    },
  );

  assert.equal(peakActive, 4);
  assert.equal(output.summary.measuredCount, 8);
  assert.equal(output.summary.failedCount, 1);
  assert.equal(output.summary.knownBytes, output.limits.totalImageMaxBytes);
  assert.equal(output.images[8]?.error?.code, "OPERATION_BYTE_LIMIT");
});
