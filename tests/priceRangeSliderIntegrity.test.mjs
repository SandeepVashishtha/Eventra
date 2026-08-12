import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sourcePath = "src/components/common/PriceRangeSlider.jsx";
const source = readFileSync(sourcePath, "utf8");

assert.match(
  source,
  /aria-label="Minimum Price"/,
  "PriceRangeSlider must have an aria-label for the minimum price input"
);

assert.match(
  source,
  /aria-label="Maximum Price"/,
  "PriceRangeSlider must have an aria-label for the maximum price input"
);

console.log("PriceRangeSlider integrity tests passed");
