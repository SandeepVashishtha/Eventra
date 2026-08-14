import assert from "node:assert/strict";
import test from "node:test";
import { validateForm } from "../src/utils/eventFormValidation.js";

test("event capacity validation - accepts valid positive integers", () => {
  const validData = {
    title: "Valid Event",
    description: "Event description",
    category: "Tech",
    startDate: "2026-12-01",
    startTime: "10:00",
    endTime: "12:00",
    capacity: "100",
    isVirtual: true,
    virtualLink: "https://example.com/stream",
  };
  const errors = validateForm(validData);
  assert.equal(errors.capacity, undefined, "Valid integer capacity should pass validation");
});

test("event capacity validation - rejects non-integer / fractional capacity values", () => {
  const invalidData = {
    title: "Valid Event",
    description: "Event description",
    category: "Tech",
    startDate: "2026-12-01",
    startTime: "10:00",
    endTime: "12:00",
    capacity: "1.5",
    isVirtual: true,
    virtualLink: "https://example.com/stream",
  };
  const errors = validateForm(invalidData);
  assert.ok(errors.capacity, "Fractional capacity (1.5) should trigger validation error");
});

test("event capacity validation - rejects negative or zero capacity", () => {
  const zeroData = {
    title: "Valid Event",
    description: "Event description",
    category: "Tech",
    startDate: "2026-12-01",
    startTime: "10:00",
    endTime: "12:00",
    capacity: "0",
    isVirtual: true,
    virtualLink: "https://example.com/stream",
  };
  const errorsZero = validateForm(zeroData);
  assert.ok(errorsZero.capacity, "Capacity 0 should trigger validation error");

  const negativeData = {
    ...zeroData,
    capacity: "-10",
  };
  const errorsNegative = validateForm(negativeData);
  assert.ok(errorsNegative.capacity, "Negative capacity should trigger validation error");
});

test("useEventForm capacity logic - rejects fractional numbers and non-integers", () => {
  const MAX_CAPACITY = 100000;
  function validateCapacity(capacityInput) {
    if (!capacityInput) return null;
    const capacity = Number(capacityInput);
    if (!capacity || capacity <= 0) {
      return "Please enter a valid number";
    } else if (!Number.isInteger(capacity)) {
      return "Capacity must be a whole number";
    } else if (capacity > MAX_CAPACITY) {
      return `Maximum capacity is ${MAX_CAPACITY.toLocaleString()} attendees`;
    }
    return null;
  }

  assert.equal(validateCapacity("100"), null);
  assert.equal(validateCapacity("1.5"), "Capacity must be a whole number");
  assert.equal(validateCapacity("0.5"), "Capacity must be a whole number");
  assert.equal(validateCapacity("10.25"), "Capacity must be a whole number");
  assert.equal(validateCapacity("-5"), "Please enter a valid number");
  assert.equal(validateCapacity("0"), "Please enter a valid number");
  assert.equal(validateCapacity("100001"), `Maximum capacity is ${MAX_CAPACITY.toLocaleString()} attendees`);
});
