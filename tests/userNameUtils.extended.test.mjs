import assert from "node:assert/strict";
import { getUserFullName } from "../src/utils/userNameUtils.mjs";

assert.equal(getUserFullName({ firstName: "John", lastName: "Doe" }), "John Doe", "standard name");
assert.equal(getUserFullName({ firstName: "Jane" }), "Jane", "single name");
assert.equal(getUserFullName({ lastName: "Smith" }), "Smith", "only last name");
assert.equal(getUserFullName({}), "", "empty object");
assert.equal(getUserFullName(null), "", "null user");
assert.equal(getUserFullName(undefined), "", "undefined user");
assert.equal(getUserFullName({ firstName: "  Bob  ", lastName: "  Alice  " }), "Bob Alice", "whitespace trimmed");
assert.equal(getUserFullName({ firstName: 123, lastName: 456 }), "123 456", "numbers converted to strings");
assert.equal(getUserFullName({ firstName: null, lastName: null }), "", "null names");

console.log("userNameUtils extended tests passed ✓");