import assert from "node:assert/strict";
import { saveFeedback, getAverageRating } from "../src/utils/feedbackUtils.js";

const store = {};
globalThis.localStorage = {
  getItem(key) { return store[key] || null; },
  setItem(key, value) { store[key] = String(value); },
  removeItem(key) { delete store[key]; }
};

const avg = getAverageRating("event123");
assert.equal(avg.average, 0);
assert.equal(avg.count, 0);

saveFeedback("event123", { rating: 5, userId: "user1", comment: "great" });
const avg2 = getAverageRating("event123");
assert.equal(avg2.average, 5);
assert.equal(avg2.count, 1);

console.log("feedbackUtils edge tests passed ✓");
