import { describe, it, expect } from "vitest";
describe("middleware token regex", () => {
  it("extracts token from cookie", () => {
    const match = "token=abc;".match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
    expect(match[1]).toBe("abc");
  });
  it("returns null for missing token", () => {
    const match = "x=1".match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
    expect(match).toBeNull();
  });
});
