import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve("src/components/common/CollaborativeWhiteboard.jsx");
const content = fs.readFileSync(filePath, "utf8");

// Test that the invalid class "bg-indigo-650" has been removed
assert.ok(!content.includes("bg-indigo-650"), "Component should not contain invalid class bg-indigo-650");

// Test that the correct class "bg-indigo-600" is present
assert.ok(content.includes("bg-indigo-600"), "Component should contain correct class bg-indigo-600");

console.log("whiteboardStyles tests passed ✓");
