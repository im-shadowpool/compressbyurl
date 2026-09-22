import assert from "node:assert/strict";
import test from "node:test";

import { inspectStaticImageSignature } from "../src/image-signature.js";
import { assertStaticImageResource, PublicFetchError } from "../src/public-http.js";

function ascii(value: string) {
  return new TextEncoder().encode(value);
}

function withPrefix(prefix: readonly number[], suffix = "") {
  const suffixBytes = ascii(suffix);
  const bytes = new Uint8Array(prefix.length + suffixBytes.length);
  bytes.set(prefix);
  bytes.set(suffixBytes, prefix.length);
  return bytes;
}

test("detects each supported static image signature", () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const webp = ascii("RIFF0000WEBPVP8 ");
  const avif = withPrefix([0, 0, 0, 24], "ftypavif");

  assert.equal(inspectStaticImageSignature(jpeg)?.format, "jpeg");
  assert.equal(inspectStaticImageSignature(png)?.format, "png");
  assert.equal(inspectStaticImageSignature(webp)?.format, "webp");
  assert.equal(inspectStaticImageSignature(avif)?.format, "avif");
});

test("detects animated PNG, WebP, and AVIF signatures", () => {
  const png = withPrefix([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "acTL");
  const webp = ascii("RIFF0000WEBPANIM");
  const avif = withPrefix([0, 0, 0, 24], "ftypavis");

  for (const bytes of [png, webp, avif]) {
    assert.equal(inspectStaticImageSignature(bytes)?.animated, true);
  }
});

test("enforces declared MIME and rejects animation", () => {
  const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
  assert.throws(
    () => assertStaticImageResource(jpeg, "image/png"),
    (error) => error instanceof PublicFetchError && error.code === "SIGNATURE_MISMATCH",
  );

  const animatedWebp = ascii("RIFF0000WEBPANIM");
  assert.throws(
    () => assertStaticImageResource(animatedWebp, "image/webp"),
    (error) => error instanceof PublicFetchError && error.code === "ANIMATED_IMAGE",
  );
});

test("returns null for unknown bytes", () => {
  assert.equal(inspectStaticImageSignature(ascii("plain text")), null);
});
