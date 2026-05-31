import assert from "node:assert/strict";

globalThis.Intl = {
  DateTimeFormat: class {
    constructor(locale, options) {
      this.options = options;
      this.locale = locale;
    }
    resolvedOptions() {
      return { timeZone: this.options?.timeZone || "UTC" };
    }
    format(date) {
      if (!(date instanceof Date)) date = new Date(date);
      if (isNaN(date.getTime())) return "Invalid date";
      const d = date;
      const tz = this.options?.timeZone || "UTC";
      const parts = {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes(),
      };
      if (this.options?.timeZoneName === "long") return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} UTC Long`;
      if (this.options?.timeZoneName === "short") return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute} UTC Short`;
      if (this.options?.weekday === "long") return `Weekday ${parts.year}-${parts.month}-${parts.day}`;
      return `${parts.year}-${String(parts.month).padStart(2,"0")}-${String(parts.day).padStart(2,"0")} ${String(parts.hour).padStart(2,"0")}:${String(parts.minute).padStart(2,"0")}`;
    }
  }
};

globalThis.RelativeTimeFormat = class {
  constructor(locale, options) {
    this.options = options;
  }
  format(value, unit) {
    return `${value > 0 ? "in" : ""} ${Math.abs(value)} ${unit}`;
  }
};

import { getUserTimezone, formatEventDate, formatEventDateRange, getRelativeTime } from "../src/utils/dateFormatter.js";

const tz = getUserTimezone();
assert.strictEqual(typeof tz === "string" && tz.length > 0, true, "getUserTimezone returns a string");

const d1 = formatEventDate("2025-06-15T10:00:00Z");
assert.strictEqual(d1.includes("2025"), true, "formatEventDate handles ISO string");

const d2 = formatEventDate(new Date("2025-06-15T10:00:00Z"));
assert.strictEqual(typeof d2, "string", "formatEventDate handles Date object");

const d3 = formatEventDate("invalid-date");
assert.strictEqual(d3, "Invalid date", "formatEventDate returns Invalid date for bad input");

const d4 = formatEventDate("2025-06-15T10:00:00Z", { format: "full" });
assert.strictEqual(typeof d4, "string", "formatEventDate handles full format");

const d5 = formatEventDate("2025-06-15T10:00:00Z", { format: "long" });
assert.strictEqual(typeof d5, "string", "formatEventDate handles long format");

const d6 = formatEventDate("2025-06-15T10:00:00Z", { format: "medium" });
assert.strictEqual(typeof d6, "string", "formatEventDate handles medium format");

const d7 = formatEventDate("2025-06-15T10:00:00Z", { format: "short" });
assert.strictEqual(typeof d7, "string", "formatEventDate handles short format");

const range = formatEventDateRange("2025-06-15T10:00:00Z", "2025-06-15T12:00:00Z");
assert.strictEqual(typeof range, "string", "formatEventDateRange returns a string");
assert.ok(range.includes(" - "), "formatEventDateRange contains range separator");

const past = getRelativeTime("2020-01-01");
assert.strictEqual(typeof past, "string", "getRelativeTime returns string for past date");

const future = getRelativeTime("2030-01-01");
assert.strictEqual(typeof future, "string", "getRelativeTime returns string for future date");

const bad = getRelativeTime("not-a-date");
assert.strictEqual(bad, "", "getRelativeTime returns empty string for invalid date");

console.log("All dateFormatter tests passed");