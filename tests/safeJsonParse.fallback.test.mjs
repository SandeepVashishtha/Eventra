import assert from "node:assert/strict";

import { safeJsonParse } from "../src/utils/safeJsonParse.js";
import { safeParseJson } from "../src/utils/jsonUtils.js";

assert.deepEqual(safeJsonParse("{bad", []), []);
assert.deepEqual(safeJsonParse(null, { fallback: true }), { fallback: true });
assert.equal(safeJsonParse("not-json", 0), 0);
assert.equal(safeJsonParse(undefined, false), false);

assert.deepEqual(safeParseJson("{bad", ["default"]), ["default"]);
assert.equal(safeParseJson(null, "empty"), "empty");
assert.deepEqual(safeParseJson('{"ok":true}', { fallback: false }), { ok: true });

console.log("safeJsonParse fallback edge tests passed ✓");
