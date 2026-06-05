import assert from "node:assert/strict";
import { getPublicErrorMessage } from "../src/utils/errorMessages.js";

const originalError = console.error;
console.error = () => {};

const msg = getPublicErrorMessage(new Error("network error"));
assert.equal(msg, "error.networkError");

console.error = originalError;
console.log("errorMessages edge tests passed ✓");
