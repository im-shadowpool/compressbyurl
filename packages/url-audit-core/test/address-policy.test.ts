import assert from "node:assert/strict";
import test from "node:test";

import { assertAllowedAddress, PublicFetchError } from "../src/public-http.js";

function expectBlocked(address: string) {
  assert.throws(
    () => assertAllowedAddress(address),
    (error) => error instanceof PublicFetchError && error.code === "UNSAFE_DESTINATION",
  );
}

test("public unicast addresses are allowed", () => {
  assert.doesNotThrow(() => assertAllowedAddress("8.8.8.8"));
  assert.doesNotThrow(() => assertAllowedAddress("2001:4860:4860::8888"));
});

test("private, metadata, loopback and mapped addresses are blocked", () => {
  for (const address of [
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.0.1",
    "169.254.169.254",
    "::1",
    "::ffff:127.0.0.1",
  ]) {
    expectBlocked(address);
  }
});

test("explicit loopback mode allows loopback but not private LAN addresses", () => {
  assert.doesNotThrow(() => assertAllowedAddress("127.0.0.1", "public-and-loopback"));
  assert.throws(
    () => assertAllowedAddress("192.168.1.2", "public-and-loopback"),
    PublicFetchError,
  );
});
