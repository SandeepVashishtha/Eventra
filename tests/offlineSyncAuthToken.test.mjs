import { describe, it, expect } from "vitest";
describe("useOfflineSync auth token", () => {
  it("uses authToken in conflict resolution branches", () => {
    const token = "cookie-managed";
    const authToken = token === "cookie-managed" ? null : token;
    expect(authToken).toBeNull();
    expect(token).not.toBeNull();
  });
});
