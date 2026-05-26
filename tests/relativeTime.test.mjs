import assert from "node:assert/strict";
import { getRelativeTime, getSmartDateLabel } from "../src/utils/relativeTime.js";

// Test invalid date
assert.equal(getRelativeTime("invalid-date"), null);

const now = new Date();

// Test past date: just ended
const pastSecDate = new Date(now.getTime() - 30 * 1000);
assert.equal(getRelativeTime(pastSecDate.toISOString()), "Just ended");

// Test past date: minutes ago
const pastMinDate = new Date(now.getTime() - 5 * 60 * 1000);
assert.equal(getRelativeTime(pastMinDate.toISOString()), "5 minutes ago");

// Test past date: 1 hour ago
const pastHourDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
assert.equal(getRelativeTime(pastHourDate.toISOString()), "1 hour ago");

// Test past date: Yesterday
const pastDayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
assert.equal(getRelativeTime(pastDayDate.toISOString()), "Yesterday");

// Test future date: starting soon
const futureSecDate = new Date(now.getTime() + 30 * 1000);
assert.equal(getRelativeTime(futureSecDate.toISOString()), "Starting soon");

// Test future date: in minutes
const futureMinDate = new Date(now.getTime() + 10 * 60 * 1000);
assert.equal(getRelativeTime(futureMinDate.toISOString()), "In 10 minutes");

// Test future date: Tomorrow
const futureDayDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
assert.equal(getRelativeTime(futureDayDate.toISOString()), "Tomorrow");

// Test getSmartDateLabel
const formattedLabel = getSmartDateLabel(futureMinDate.toISOString());
assert.equal(formattedLabel, "In 10 minutes");
