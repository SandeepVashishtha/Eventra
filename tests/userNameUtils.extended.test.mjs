/**
 * Extended unit tests for the fixed src/utils/userNameUtils.mjs
 *
 * Validates that the helper safely handles null, undefined, object-type,
 * number-type, and array-type inputs without crashing.
 */

import assert from "node:assert/strict";
import { getUserFullName } from "../src/utils/userNameUtils.mjs";

// ── Existing baseline ────────────────────────────────────────────────────────
assert.equal(getUserFullName(null), "", "null user returns empty string");
assert.equal(getUserFullName(undefined), "", "undefined user returns empty string");
assert.equal(getUserFullName({}), "", "empty user object returns empty string");
assert.equal(getUserFullName({ firstName: "Ada" }), "Ada", "firstName only");
assert.equal(getUserFullName({ lastName: "Lovelace" }), "Lovelace", "lastName only");
assert.equal(
  getUserFullName({ firstName: " Ada ", lastName: " Lovelace " }),
  "Ada Lovelace",
  "names are trimmed and joined with a space"
);

// ── Object / Array / Symbol fields (must not throw) ──────────────────────────
assert.doesNotThrow(
  () => getUserFullName({ firstName: {}, lastName: [] }),
  "object-type fields do not throw"
);
assert.equal(
  getUserFullName({ firstName: {}, lastName: [] }),
  "",
  "object/array fields produce empty string"
);

assert.doesNotThrow(
  () => getUserFullName({ firstName: Symbol("x"), lastName: "Jones" }),
  "Symbol firstName does not throw"
);
assert.equal(
  getUserFullName({ firstName: Symbol("x"), lastName: "Jones" }),
  "Jones",
  "Symbol firstName is silently dropped"
);

// ── Number fields (coerced to string) ────────────────────────────────────────
assert.equal(
  getUserFullName({ firstName: 42, lastName: "Jones" }),
  "42 Jones",
  "numeric firstName is coerced to string"
);
assert.equal(
  getUserFullName({ firstName: "Alice", lastName: 7 }),
  "Alice 7",
  "numeric lastName is coerced to string"
);
assert.equal(
  getUserFullName({ firstName: 0, lastName: "Zero" }),
  "0 Zero",
  "firstName of 0 is coerced to '0' and included"
);
assert.equal(
  getUserFullName({ firstName: Infinity }),
  "",
  "Infinity firstName is ignored"
);
assert.equal(
  getUserFullName({ firstName: NaN }),
  "",
  "NaN firstName is ignored"
);

// ── Boolean fields ───────────────────────────────────────────────────────────
assert.doesNotThrow(
  () => getUserFullName({ firstName: true, lastName: false }),
  "boolean fields do not throw"
);
assert.equal(
  getUserFullName({ firstName: true, lastName: false }),
  "",
  "boolean fields produce empty string"
);

// ── Whitespace-only names ────────────────────────────────────────────────────
assert.equal(
  getUserFullName({ firstName: "   ", lastName: "Smith" }),
  "Smith",
  "whitespace-only firstName is trimmed and filtered out"
);
assert.equal(
  getUserFullName({ firstName: "Alice", lastName: "\t\n" }),
  "Alice",
  "whitespace-only lastName is trimmed and filtered out"
);

console.log("All userNameUtils tests passed ✓");
