import assert from "node:assert/strict";

import { getUserFullName } from "../src/utils/userNameUtils.mjs";

assert.equal(getUserFullName({ firstName: "O'Brien", lastName: "Lee" }), "O'Brien Lee");
assert.equal(getUserFullName({ firstName: "李", lastName: "雷" }), "李 雷");
assert.equal(getUserFullName({ firstName: true, lastName: false }), "");
assert.equal(getUserFullName({ firstName: NaN, lastName: "Valid" }), "Valid");
assert.equal(getUserFullName({ firstName: "  ", lastName: "OnlyLast" }), "OnlyLast");

console.log("userNameUtils edge-case tests passed ✓");
