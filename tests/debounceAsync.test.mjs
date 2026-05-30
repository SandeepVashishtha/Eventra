import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  DebounceCancelledError,
  createDebouncedValidator,
  debounceAsync,
  isDebounceCancelledError,
} from "../src/utils/debounceUtils.js";

describe("debounceAsync", () => {
  it("runs the async function after the delay", async () => {
    let calls = 0;
    const fn = debounceAsync(async (value) => {
      calls += 1;
      return value.toUpperCase();
    }, 20);

    const result = await fn("hello");
    assert.equal(result, "HELLO");
    assert.equal(calls, 1);
  });

  it("cancels superseded calls with DebounceCancelledError", async () => {
    const fn = debounceAsync(async (value) => value, 30);
    const first = fn("one");
    const second = fn("two");

    await assert.rejects(first, (error) => isDebounceCancelledError(error));
    assert.equal(await second, "two");
  });

  it("flush executes immediately and cancel clears pending work", async () => {
    let calls = 0;
    const fn = debounceAsync(async (value) => {
      calls += 1;
      return value;
    }, 100);

    const pending = fn("pending");
    fn.cancel();
    await assert.rejects(pending, (error) => error instanceof DebounceCancelledError);

    assert.equal(await fn.flush("now"), "now");
    assert.equal(calls, 1);
  });

  it("supports resolveOnCancel for soft cancellation", async () => {
    const fn = debounceAsync(async (value) => value, 30, {
      resolveOnCancel: true,
      cancelledValue: "cancelled",
    });

    const first = fn("one");
    assert.equal(await fn("two"), "two");
    assert.equal(await first, "cancelled");
  });
});

describe("createDebouncedValidator", () => {
  it("returns a standardized cancelled validation result", async () => {
    const validator = createDebouncedValidator(async (value) => ({
      isValid: value.length >= 3,
      message: value.length >= 3 ? "ok" : "too short",
    }), 25);

    const first = validator("ab");
    const second = await validator("abcd");

    assert.deepEqual(await first, {
      isValid: false,
      message: "Validation cancelled",
      cancelled: true,
    });
    assert.deepEqual(second, { isValid: true, message: "ok" });
  });
});

describe("isDebounceCancelledError", () => {
  it("detects DebounceCancelledError instances and cancelled flags", () => {
    assert.equal(isDebounceCancelledError(new DebounceCancelledError()), true);
    assert.equal(isDebounceCancelledError({ cancelled: true }), true);
    assert.equal(isDebounceCancelledError(new Error("nope")), false);
  });
});

console.log("debounceAsync tests passed ✓");
