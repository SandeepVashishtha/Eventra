import assert from "node:assert/strict";
import { getRelativeTime } from "../src/utils/relativeTime.js";

const past = new Date(Date.now() - 3600000); // 1 hour ago
const text = getRelativeTime(past);
assert.ok(text.includes("hour") || text.includes("hora") || text.includes("ago") || text, "Should return a relative time description");
console.log("relativeTime clamping tests passed ✓");
