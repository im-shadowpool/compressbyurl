import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchPublicResource as coreFetchPublicResource,
  PublicFetchError as CorePublicFetchError,
} from "@compressbyurl/url-audit-core/network";

import { fetchPublicResource, PublicFetchError } from "../src/network.js";

test("MCP consumes the shared URL security implementation", () => {
  assert.equal(fetchPublicResource, coreFetchPublicResource);
  assert.equal(PublicFetchError, CorePublicFetchError);
});
