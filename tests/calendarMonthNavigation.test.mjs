import assert from "node:assert/strict";
import { navigateCalendarDate } from "../src/utils/eventSchedulingUtils.js";

// #14614: navigating months from a 29th/30th/31st anchor must not skip a month.
// JS Date setMonth clamps the day, so Jan 31 + 1 month would roll to Mar 3.

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 0, 31), "month", "next")),
  "2026-02-01",
  "Jan 31 -> next month must land in February, not March",
);
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 2, 31), "month", "next")),
  "2026-04-01",
  "Mar 31 -> next month must land in April",
);
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 2, 30), "month", "next")),
  "2026-04-01",
  "Mar 30 -> next month must land in April",
);
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 2, 31), "month", "prev")),
  "2026-02-01",
  "Mar 31 -> prev month must land in February",
);
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 6, 31), "month", "next")),
  "2026-08-01",
  "Jul 31 -> next month must land in August (31-day target)",
);
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 0, 15), "month", "next")),
  "2026-02-01",
  "Jan 15 -> next month lands on the 1st of February",
);
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 0, 15), "month", "prev")),
  "2025-12-01",
  "Jan 15 -> prev month lands on the 1st of December",
);

// Week / day navigation unaffected
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 0, 15), "week", "next")),
  "2026-01-22",
  "week nav unchanged",
);
assert.equal(
  ymd(navigateCalendarDate(new Date(2026, 0, 15), "day", "next")),
  "2026-01-16",
  "day nav unchanged",
);

console.log("calendar month navigation tests passed");
