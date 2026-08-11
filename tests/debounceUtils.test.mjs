import assert from "node:assert/strict";

const pendingTimers = [];
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;

global.setTimeout = (fn, delay) => {
  const timer = { fn, delay, cleared: false };
  pendingTimers.push(timer);
  return timer;
};
global.clearTimeout = (timer) => {
  if (timer) timer.cleared = true;
};

const {
  DebounceCancelledError,
  debounceAsync,
  createDebouncedValidator,
  isDebounceCancelledError,
} = await import("../src/utils/debounceUtils.js");

const debounced = debounceAsync(async (value) => `checked:${value}`, 500);
const firstCall = debounced("first").catch((error) => error);
const secondCall = debounced("second");

pendingTimers.at(-1).fn();
const firstResult = await firstCall;
const secondResult = await secondCall;

assert.ok(isDebounceCancelledError(firstResult), "superseded call is cancelled");
assert.equal(secondResult, "checked:second", "latest call resolves");

const validator = createDebouncedValidator(async () => ({ isValid: true, message: "" }), 500);
const cancelled = validator("old");
const latest = validator("new");
pendingTimers.at(-1).fn();

assert.deepEqual(await cancelled, {
  isValid: false,
  message: "Validation cancelled",
  cancelled: true,
});
assert.deepEqual(await latest, { isValid: true, message: "" });
assert.ok(new DebounceCancelledError() instanceof Error);

global.setTimeout = originalSetTimeout;
global.clearTimeout = originalClearTimeout;

console.log("debounceUtils tests passed ✓");
