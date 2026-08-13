import assert from "node:assert/strict";
import { throttleAsync } from "../src/utils/debounceUtils.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Trailing-edge callers must resolve with the trailing (latest args) result,
// not the leading result, and the trailing execution must not be discarded.
const calls = [];
const throttled = throttleAsync(async (value) => {
  calls.push(value);
  await delay(10);
  return `result:${value}`;
}, 50);

const leading = throttled("first");
const trailing = throttled("second");

assert.equal(await leading, "result:first", "leading call returns its own result");
await delay(80);
assert.equal(
  await trailing,
  "result:second",
  "trailing call should resolve with the trailing execution result",
);
assert.deepEqual(
  calls,
  ["first", "second"],
  "asyncFn should run exactly once for the leading edge and once for the trailing edge",
);

// A trailing call that arrives later in the same window should also receive the
// trailing result computed from the latest args.
const throttled2 = throttleAsync(async (value) => {
  await delay(5);
  return `result:${value}`;
}, 50);
const t1 = throttled2("a");
const t2 = throttled2("b");
const t3 = throttled2("c");
assert.equal(await t1, "result:a", "leading call of second throttle returns its own result");
await delay(80);
assert.equal(await t2, "result:c", "superseded trailing call resolves with the latest trailing result");
assert.equal(await t3, "result:c", "latest trailing call resolves with the latest trailing result");

console.log("throttleAsync tests passed ✓");
