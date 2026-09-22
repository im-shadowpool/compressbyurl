import assert from "node:assert/strict";
import test from "node:test";

import { extractWebsiteScanManifest } from "../src/extract-candidates.js";
import { websiteScanManifestSchema } from "../src/schemas.js";

test("extracts supported static HTML candidate sources deterministically", () => {
  const manifest = extractWebsiteScanManifest(
    `<title>  Example   page </title>
     <meta property="og:image" content="/og.jpg">
     <link rel="preload" as="image" href="/hero.webp">
     <picture><source srcset="/small.avif 1x, /large.avif 2x"></picture>
     <img src="/hero.webp" data-src="/lazy.png"
          srcset="/one.jpg 320w, /two.jpg 640w"
          width="640" height="480" alt=" Hero ">`,
    "https://example.com/path/page",
    80,
  );

  assert.equal(websiteScanManifestSchema.safeParse(manifest).success, true);
  assert.equal(manifest.page.title, "Example page");
  assert.equal(manifest.totalFound, 7);
  assert.deepEqual(manifest.candidates[0]?.sources, ["image", "preload"]);
  assert.deepEqual(
    manifest.candidates.map(({ id, source, url }) => ({ id, source, url })),
    [
      { id: "image-1", source: "image", url: "https://example.com/hero.webp" },
      { id: "image-2", source: "lazy-image", url: "https://example.com/lazy.png" },
      { id: "image-3", source: "srcset", url: "https://example.com/one.jpg" },
      { id: "image-4", source: "srcset", url: "https://example.com/two.jpg" },
      { id: "image-5", source: "picture", url: "https://example.com/small.avif" },
      { id: "image-6", source: "picture", url: "https://example.com/large.avif" },
      { id: "image-7", source: "metadata", url: "https://example.com/og.jpg" },
    ],
  );
});

test("deduplicates candidates and discloses truncation", () => {
  const manifest = extractWebsiteScanManifest(
    '<img src="/a.png"><img src="/a.png"><img src="/b.png">',
    "https://example.com",
    1,
  );

  assert.equal(manifest.candidates.length, 1);
  assert.equal(manifest.totalFound, 2);
  assert.equal(manifest.limits.truncated, true);
});
