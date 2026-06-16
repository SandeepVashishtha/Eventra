import { describe, test, assert, beforeEach, afterEach } from "vitest";

describe("checkCapacity", () => {
  let checkCapacity;

  beforeEach(async () => {
    const mod = await import("../../api/_lib/capacityValidator.js");
    checkCapacity = mod.checkCapacity;
  });

  test("allows registration when capacity available", () => {
    const result = checkCapacity({
      event: { maxAttendees: 100 },
      currentCount: 50,
      requestedSeats: 1,
    });
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.remaining, 49);
  });

  test("blocks registration when at full capacity", () => {
    const result = checkCapacity({
      event: { maxAttendees: 100 },
      currentCount: 100,
      requestedSeats: 1,
    });
    assert.strictEqual(result.allowed, false);
    assert.strictEqual(result.reason, "Event is at full capacity");
  });

  test("blocks registration when requested seats exceed remaining", () => {
    const result = checkCapacity({
      event: { maxAttendees: 10 },
      currentCount: 8,
      requestedSeats: 3,
    });
    assert.strictEqual(result.allowed, false);
  });

  test("treats zero maxAttendees as unlimited", () => {
    const result = checkCapacity({
      event: { maxAttendees: 0 },
      currentCount: 50,
      requestedSeats: 1,
    });
    assert.strictEqual(result.allowed, true);
  });

  test("treats null maxAttendees as unlimited", () => {
    const result = checkCapacity({
      event: { maxAttendees: null },
      currentCount: 50,
      requestedSeats: 1,
    });
    assert.strictEqual(result.allowed, true);
  });

  test("treats undefined maxAttendees as unlimited", () => {
    const result = checkCapacity({
      event: {},
      currentCount: 50,
      requestedSeats: 1,
    });
    assert.strictEqual(result.allowed, true);
  });

  test("defaults requestedSeats to 1", () => {
    const result = checkCapacity({
      event: { maxAttendees: 5 },
      currentCount: 3,
    });
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.remaining, 1);
  });

  test("handles NaN in currentCount gracefully", () => {
    const result = checkCapacity({
      event: { maxAttendees: 100 },
      currentCount: NaN,
      requestedSeats: 1,
    });
    assert.strictEqual(result.allowed, true);
  });

  test("handles string numbers in inputs", () => {
    const result = checkCapacity({
      event: { maxAttendees: "50" },
      currentCount: "25",
      requestedSeats: "1",
    });
    assert.strictEqual(result.allowed, true);
  });

  test("returns correct remaining calculation", () => {
    const result = checkCapacity({
      event: { maxAttendees: 100 },
      currentCount: 30,
      requestedSeats: 2,
    });
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.remaining, 68);
    assert.strictEqual(result.currentCount, 30);
    assert.strictEqual(result.capacity, 100);
  });
});
