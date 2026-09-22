import assert from "node:assert/strict";
import test from "node:test";

import { toolError } from "../src/errors.js";

test("tool errors are model-visible and do not expose stacks", () => {
  const result = toolError("INVALID_INPUT", "The request is invalid.");

  assert.equal(result.isError, true);
  assert.equal(result.content.length, 1);
  const content = result.content[0];
  assert.equal(content?.type, "text");
  if (content?.type !== "text") assert.fail("Expected text content");
  assert.deepEqual(JSON.parse(content.text), {
    error: {
      code: "INVALID_INPUT",
      message: "The request is invalid.",
    },
  });
  assert.equal(content.text.includes("stack"), false);
});
