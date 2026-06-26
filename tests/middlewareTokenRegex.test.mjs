import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("middleware token regex", () => {
  it("extracts token from cookie", () => {
    const match = "token=abc;".match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
    assert.strictEqual(match[1], "abc");
  });
  it("returns null for missing token", () => {
    const match = "x=1".match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
    assert.strictEqual(match, null);
  });
});
