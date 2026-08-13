import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { areFiltersEqual } from "../src/utils/filterUtils.js";

describe("React Query Hydration Mismatch Tests", () => {
  it("should evaluate structural deep equality on filter configuration states", () => {
    const f1 = { category: "ai", search: "summit", date: "today" };
    const f2 = { category: "ai", search: "summit", date: "today" };
    const f3 = { category: "ai", search: "summit", date: "tomorrow" };

    assert.equal(areFiltersEqual(f1, f2), true);
    assert.equal(areFiltersEqual(f1, f3), false);
  });
});
