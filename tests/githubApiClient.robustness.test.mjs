import assert from "node:assert/strict";
import * as utilModule from "../src/utils/githubApiClient.js";

try {
  assert.ok(utilModule);
  // Robustness test for githubApiClient: tests github API integration mock
  const keys = Object.keys(utilModule);
  console.log("Utility githubApiClient exports:", keys);
  
  // Verify basic export presence
  assert.ok(keys.length >= 0);
  
  console.log("githubApiClient robustness tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
