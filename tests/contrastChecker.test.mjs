import assert from "node:assert/strict";
import { getContrastRatio } from "../src/utils/contrastChecker.js";

const ratio = getContrastRatio("#ffffff", "#000000");
assert.ok(ratio > 20, "white and black should have maximum contrast ratio");
console.log("contrastChecker tests passed ✓");
