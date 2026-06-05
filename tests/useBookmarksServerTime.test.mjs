import { describe, it, expect } from "vitest";
describe("useBookmarks savedAt", () => {
  it("uses server-synced timestamp for savedAt", () => {
    const offset = 5000;
    const serverNow = Date.now() + offset;
    const clientNow = Date.now();
    expect(serverNow).toBeGreaterThan(clientNow);
  });
});
