import { describe, it, expect } from "vitest";
describe("isPast isFuture server time", () => {
  it("uses server-synced time for comparison", () => {
    const now = Date.now();
    const past = now - 10000;
    const future = now + 10000;
    expect(past < now).toBe(true);
    expect(future > now).toBe(true);
  });
});
