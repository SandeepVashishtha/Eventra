import assert from "node:assert/strict";
import { getPublicErrorMessage } from "../src/utils/errorMessages.js";

const originalError = console.error;
console.error = () => {};

const msg = getPublicErrorMessage(new Error("network error"));
assert.ok(msg === "error.networkError" || msg === "Unable to reach the server. Please check your connection.");

console.error = originalError;
console.log("errorMessages edge tests passed ✓");
