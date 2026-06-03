import assert from "node:assert/strict";
import { getUserTimezone, formatEventDate, formatEventDateRange, getRelativeTime } from "../src/utils/dateFormatter.js";

try {
  const tz = getUserTimezone();
  assert.ok(typeof tz === "string");

  const d = new Date("2026-06-03T12:00:00Z");
  const formatted = formatEventDate(d, { timezone: "UTC", locale: "en-US", format: "medium" });
  assert.ok(formatted.includes("2026") || formatted.includes("Jun"));

  const range = formatEventDateRange(d, new Date("2026-06-03T15:00:00Z"), { timezone: "UTC", locale: "en-US" });
  assert.ok(range.includes("-"));

  const rel = getRelativeTime(new Date(Date.now() + 86400000));
  assert.ok(typeof rel === "string");

  console.log("dateFormatter tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
