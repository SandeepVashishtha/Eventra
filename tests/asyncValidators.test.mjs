import assert from "node:assert/strict";
import { createAsyncValidator, withRetry, validatePasswordStrength } from "../src/utils/asyncValidators.js";

const mockValidator = async (val) => val === "valid" || "invalid";
const debounced = createAsyncValidator(mockValidator, 10);
const res = await debounced("valid");
assert.equal(res, true);

let attempts = 0;
const failingValidator = async () => {
  attempts++;
  if (attempts < 2) throw new Error("Temp error");
  return true;
};
const retrying = withRetry(failingValidator, 3, 5);
const retryRes = await retrying();
assert.equal(retryRes, true);
assert.equal(attempts, 2);

const strong = await validatePasswordStrength("SecurePass123!");
assert.equal(strong, true);

console.log("asyncValidators tests passed ✓");
