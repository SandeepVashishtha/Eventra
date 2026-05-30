import assert from "node:assert/strict";

import * as debouncedValueModule from "../src/hooks/useDebouncedValue.js";

const exportedNames = Object.keys(debouncedValueModule);
assert.ok(exportedNames.includes("useDebouncedValue"), "useDebouncedValue should be exported");
assert.ok(exportedNames.includes("useDebouncedCallback"), "useDebouncedCallback should be exported");
assert.ok(exportedNames.includes("useDebouncedSearch"), "useDebouncedSearch should be exported");

assert.strictEqual(typeof debouncedValueModule.useDebouncedValue, "function", "useDebouncedValue should be a function");
assert.strictEqual(typeof debouncedValueModule.useDebouncedCallback, "function", "useDebouncedCallback should be a function");
assert.strictEqual(typeof debouncedValueModule.useDebouncedSearch, "function", "useDebouncedSearch should be a function");

console.log("useDebouncedValue tests passed ✓");