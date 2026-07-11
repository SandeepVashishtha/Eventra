import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const source = readFileSync(
  new URL("../Pages/Events/EventFiltersToolbar.js", import.meta.url),
  "utf8",
);

describe("EventFiltersToolbar source contract", () => {
  it("accepts currentFilterConfig from props", () => {
    expect(source).toContain("currentFilterConfig = {}");
  });

  it("forwards currentFilterConfig into useFilterSuggestions", () => {
    expect(source).toContain("currentFilters: currentFilterConfig");
  });
});
