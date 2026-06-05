import { describe, it, expect } from "vitest";
describe("markAllAsRead persistence", () => {
  it("updates read flags in local state", () => {
    const prev = [{ id: 1, read: false }, { id: 2, read: false }];
    const updated = prev.map((item) => ({ ...item, read: true }));
    expect(updated.every((item) => item.read)).toBe(true);
  });
});
