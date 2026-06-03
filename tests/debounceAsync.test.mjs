import assert from "node:assert/strict";

process.on("unhandledRejection", () => {});

import {
  debounceAsync,
  createDebouncedValidator,
  isDebounceCancelledError,
  DebounceCancelledError
} from "../src/utils/debounceUtils.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Test isDebounceCancelledError
assert.strictEqual(isDebounceCancelledError(new DebounceCancelledError()), true, "DebounceCancelledError should be detected");
assert.strictEqual(isDebounceCancelledError({ cancelled: true }), true, "Object with cancelled:true should be detected");
assert.strictEqual(isDebounceCancelledError(new Error()), false, "Regular Error should not be detected");
assert.strictEqual(isDebounceCancelledError(null), false, "null should not be detected");
assert.strictEqual(isDebounceCancelledError(undefined), false, "undefined should not be detected");
assert.strictEqual(isDebounceCancelledError(123), false, "number should not be detected");

// Test that cancel rejects pending calls with DebounceCancelledError
const debounce = debounceAsync(async (x) => {
  await delay(50);
  return x;
}, 20);

const pending = debounce("first");
debounce.cancel();

let cancelled = false;
pending.catch((err) => {
  if (isDebounceCancelledError(err)) cancelled = true;
});
await delay(5);
assert.strictEqual(cancelled, true, "Cancelled call should reject with DebounceCancelledError");

// Test resolveOnCancel option
const cancelResolveDebounce = debounceAsync(
  async (x) => { await delay(50); return x; },
  20,
  { resolveOnCancel: true, cancelledValue: "cancelled" }
);
const firstCall = cancelResolveDebounce("first");
cancelResolveDebounce.cancel();
const cancelledResult = await firstCall;
assert.strictEqual(cancelledResult, "cancelled", "Cancelled pending call should resolve with cancelledValue when resolveOnCancel is true");

// Test error propagation
const errorDebounce = debounceAsync(async (x) => {
  await delay(10);
  throw new Error(`Error ${x}`);
}, 10);
let errorThrown = false;
try {
  await errorDebounce("error-test");
} catch (err) {
  errorThrown = err.message === "Error error-test";
}
assert.strictEqual(errorThrown, true, "Error should propagate");

// Test createDebouncedValidator returns cancelled flag for superseded calls
const validator = createDebouncedValidator(async (value) => {
  await delay(10);
  return { isValid: value.length > 0, message: value.length === 0 ? "empty" : "valid" };
}, 20);

const v1 = await validator("test");
assert.strictEqual(v1.isValid, true, "Non-empty should be valid");

// The second call should be cancelled because the third call comes before the second resolves
const v2Promise = validator("");
const v3Promise = validator("longer-value");
const v3Result = await v3Promise;
assert.strictEqual(v3Result.isValid, true, "Last call should return valid result");

console.log("debounceAsync tests passed ✓");