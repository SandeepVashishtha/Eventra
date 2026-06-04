import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/common/OfflineBanner.jsx", "utf8");

assert.match(source, /syncSummary/);
assert.match(source, /dropped > 0/);
assert.match(source, /succeeded/);
assert.match(source, /queued action\(s\) could not be synced/);

console.log("offline banner sync feedback contract passed");
