import assert from "node:assert/strict";
import { createAsyncValidator, withRetry, validatePasswordStrength, resolveValidationUrl } from "../src/utils/asyncValidators.js";

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

// Test resolveValidationUrl functionality
assert.equal(resolveValidationUrl(""), "");
assert.equal(resolveValidationUrl("https://example.com/api/validate/email"), "https://example.com/api/validate/email");
assert.equal(resolveValidationUrl("http://example.com/api/validate/email"), "http://example.com/api/validate/email");

const resolvedRelative = resolveValidationUrl("/validate/username/john");
assert.ok(resolvedRelative.includes("/validate/username/john"));
assert.ok(!resolvedRelative.includes("/api/api/"));

const resolvedWithApiPrefix = resolveValidationUrl("/api/validate/username/john");
assert.ok(resolvedWithApiPrefix.includes("/validate/username/john"));
assert.ok(!resolvedWithApiPrefix.includes("/api/api/"));

console.log("asyncValidators tests passed ✓");

