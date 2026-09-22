import assert from "node:assert/strict";
import test from "node:test";

import { createMcpServer } from "../src/server.js";
import { createServerInfo } from "../src/contracts.js";

test("server factory creates independent MCP server instances", () => {
  const first = createMcpServer();
  const second = createMcpServer();

  assert.notEqual(first, second);
  assert.equal(typeof first.connect, "function");
  assert.equal(typeof second.connect, "function");
});

test("server information discloses explicit loopback mode", () => {
  assert.equal(createServerInfo().security.publicNetworkOnly, true);
  assert.equal(createServerInfo(false).security.publicNetworkOnly, false);
  assert.deepEqual(createServerInfo(true, ["12345678"]).security.workspaceRootIds, [
    "12345678",
  ]);
});
