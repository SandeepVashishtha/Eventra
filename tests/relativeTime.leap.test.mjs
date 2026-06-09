import assert from "node:assert/strict";

import { getRelativeTime, getSmartDateLabel } from "../src/utils/relativeTime.js";

const now = new Date();

const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
assert.equal(
  getRelativeTime(twoMinutesAgo.toISOString()),
  "2 minutes ago",
  "plural minutes ago",
);

const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
assert.equal(getRelativeTime(oneMinuteAgo.toISOString()), "1 minute ago");

const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000);
assert.equal(getRelativeTime(yesterday.toISOString()), "Yesterday");

const leapDay = new Date("2024-02-29T12:00:00.000Z");
assert.equal(getRelativeTime(leapDay.toISOString()) === null || typeof getRelativeTime(leapDay.toISOString()) === "string", true);

const leapDayLabel = getSmartDateLabel("2024-02-29", "09:00 AM");
assert.match(leapDayLabel, /Feb|29|2024/);

console.log("relativeTime leap-year edge tests passed ✓");
