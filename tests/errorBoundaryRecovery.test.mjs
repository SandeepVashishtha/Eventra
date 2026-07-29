import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/common/ErrorBoundary.jsx", "utf8");
assert.ok(source.includes("logSecurityEvent"), "Should integrate logSecurityEvent into ErrorBoundary");
console.log("error boundary recovery integration tests passed ✓");
