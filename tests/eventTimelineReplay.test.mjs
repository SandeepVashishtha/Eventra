import assert from "node:assert/strict";
import {
  getTimelineEvents,
  getChartDataPoints,
  sliderToHours,
  getFormattedSimTime,
  calculateMilestoneProgress
} from "../src/utils/eventTimelineUtils.js";

// Test sliderToHours conversion
assert.equal(sliderToHours(0), -24, "0% slider value maps to -24 hours relative time");
assert.equal(sliderToHours(75), 0, "75% slider value maps to 0 hours relative time (Event Start)");
assert.equal(sliderToHours(100), 8, "100% slider value maps to 8 hours relative time (Event End)");

// Test timeline events generator
const events = getTimelineEvents("Test Event");
assert.ok(Array.isArray(events), "getTimelineEvents returns an array");
assert.ok(events.length > 0, "timeline events array is not empty");
assert.equal(events[0].type, "registration", "first event type is registration");
assert.equal(events[events.length - 1].type, "announcement", "last event type is announcement");
assert.ok(events[events.length - 1].desc.includes("Test Event"), "timeline contains the event title in description");

// Ensure events are chronological
for (let i = 1; i < events.length; i++) {
  assert.ok(
    events[i].t >= events[i - 1].t,
    `Event at index ${i} (t=${events[i].t}) occurs after or at event at index ${i - 1} (t=${events[i - 1].t})`
  );
}

// Test chart data points generator
const chartData = getChartDataPoints();
assert.ok(Array.isArray(chartData), "getChartDataPoints returns an array");
assert.equal(chartData.length, 18, "chart data has exactly 18 data points");
assert.equal(chartData[0].t, -24.0, "first chart point is at -24.0 hours");
assert.equal(chartData[chartData.length - 1].t, 8.0, "last chart point is at 8.0 hours");

// Ensure chart points are chronological
for (let i = 1; i < chartData.length; i++) {
  assert.ok(
    chartData[i].t > chartData[i - 1].t,
    `Chart point at index ${i} occurs chronologically after index ${i - 1}`
  );
}

// Test getFormattedSimTime formatter
const formattedStr1 = getFormattedSimTime(-24, "2026-03-15", "10:00 AM");
const formattedStr2 = getFormattedSimTime(0, "2026-03-15", "10:00 AM");
const formattedStr3 = getFormattedSimTime(8, "2026-03-15", "10:00 AM");

assert.ok(formattedStr1.includes("Mar 14") && (formattedStr1.includes("10:00 AM") || formattedStr1.includes("10:00")), "formats 24 hours before properly");
assert.ok(formattedStr2.includes("Mar 15") && (formattedStr2.includes("10:00 AM") || formattedStr2.includes("10:00")), "formats event start properly");
assert.ok(formattedStr3.includes("Mar 15") && (formattedStr3.includes("06:00 PM") || formattedStr3.includes("6:00 PM") || formattedStr3.includes("18:00")), "formats 8 hours after event start properly");

// Test calculateMilestoneProgress with valid dates
const milestoneValid = {
  startDate: new Date("2026-08-01T00:00:00Z"),
  endDate: new Date("2026-08-11T00:00:00Z")
};
assert.equal(calculateMilestoneProgress(milestoneValid, new Date("2026-08-01T00:00:00Z")), 0, "0% at start date");
assert.equal(calculateMilestoneProgress(milestoneValid, new Date("2026-08-06T00:00:00Z")), 50, "50% at midpoint");
assert.equal(calculateMilestoneProgress(milestoneValid, new Date("2026-08-11T00:00:00Z")), 100, "100% at end date");
assert.equal(calculateMilestoneProgress(milestoneValid, new Date("2026-07-31T00:00:00Z")), 0, "0% before start date");
assert.equal(calculateMilestoneProgress(milestoneValid, new Date("2026-08-15T00:00:00Z")), 100, "100% after end date");

// Test calculateMilestoneProgress with string dates and numbers
const milestoneStrings = {
  startDate: "2026-08-01T00:00:00Z",
  endDate: "2026-08-11T00:00:00Z"
};
assert.equal(calculateMilestoneProgress(milestoneStrings, "2026-08-06T00:00:00Z"), 50, "handles ISO string dates correctly");

// Test calculateMilestoneProgress with invalid/missing milestone data
assert.equal(calculateMilestoneProgress(null), 0, "returns 0 for null milestone");
assert.equal(calculateMilestoneProgress(undefined), 0, "returns 0 for undefined milestone");
assert.equal(calculateMilestoneProgress("invalid"), 0, "returns 0 for non-object milestone");
assert.equal(calculateMilestoneProgress({}), 0, "returns 0 for empty milestone object");
assert.equal(calculateMilestoneProgress({ startDate: "2026-08-01" }), 0, "returns 0 for missing endDate");
assert.equal(calculateMilestoneProgress({ endDate: "2026-08-11" }), 0, "returns 0 for missing startDate");
assert.equal(calculateMilestoneProgress({ startDate: "invalid-date", endDate: "2026-08-11" }), 0, "returns 0 for invalid startDate string");
assert.equal(calculateMilestoneProgress({ startDate: "2026-08-01", endDate: "invalid-date" }), 0, "returns 0 for invalid endDate string");
assert.equal(calculateMilestoneProgress({ startDate: null, endDate: null }), 0, "returns 0 for null dates");
assert.equal(calculateMilestoneProgress({ startDate: true, endDate: "2026-08-11" }), 0, "returns 0 for boolean date");
assert.equal(calculateMilestoneProgress({ startDate: "2026-08-11", endDate: "2026-08-01" }), 0, "returns 0 when startDate >= endDate");

console.log("event timeline replay unit tests passed ✓");

