import assert from "node:assert/strict";
import {
  computeAttendancePrediction,
  buildWaitlistPromotionSummary,
  getPredictedAttendanceSummary
} from "../src/utils/attendancePrediction.js";

// Helper to generate ISO string offset by days
const getOffsetDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

// Test 1: computeAttendancePrediction with standard properties
const baseEvent = {
  title: "Hackathon 2026",
  startDate: getOffsetDate(5), // 5 days from now
  registrationDate: getOffsetDate(-10), // registered 10 days ago
  attendees: 95,
  maxAttendees: 100,
  price: 0, // free
  eventMode: "online",
  waitlistCount: 20,
  engagementScore: 0.9,
  pastAttendanceRate: 0.5
};

const result = computeAttendancePrediction(baseEvent, { reminders: [1, 2] });
assert.ok(result.attendanceProbability > 50, "Online free event with high parameters has high attendance probability");
assert.equal(result.confidenceLabel, "High confidence", "Matches confidence label");
assert.equal(result.waitlistSize, 20, "waitlist size matches event data");
assert.ok(result.recommendedPromotions >= 0, "Recommended promotions count is non-negative");

// Test 2: computeAttendancePrediction with empty/fallback event
const emptyResult = computeAttendancePrediction({});
assert.equal(emptyResult.attendanceProbability, 53, "default probability for empty event");
assert.equal(emptyResult.confidenceLabel, "Very low confidence", "Matches very low confidence label");

// Test 3: computeAttendancePrediction for expensive offline event far in the future
const lowEvent = {
  startDate: getOffsetDate(100), // 100 days from now
  attendees: 10,
  maxAttendees: 100,
  price: 500, // expensive
  eventMode: "offline"
};
const lowResult = computeAttendancePrediction(lowEvent);
assert.ok(lowResult.attendanceProbability < 65, "Expensive far offline event has lower probability");

// Test 4: buildWaitlistPromotionSummary
const promoSummary = buildWaitlistPromotionSummary(baseEvent, { reminders: [1, 2] });
assert.ok(promoSummary.summary.includes("Promote"), "Suggests waitlist promotion under expected no-shows");
assert.ok(promoSummary.seatsToPromote >= 0, "Returns non-negative seats to promote");

const noWaitlistSummary = buildWaitlistPromotionSummary({ ...baseEvent, waitlistCount: 0 });
assert.equal(noWaitlistSummary.summary, "No waitlist data available.", "Returns fallback for no waitlist");

// Test 5: getPredictedAttendanceSummary
const predSummary = getPredictedAttendanceSummary(baseEvent);
assert.equal(predSummary.title, "Hackathon 2026", "Title matches event title");
assert.ok(predSummary.attendanceProbability > 50, "Includes probability metric");
assert.ok(typeof predSummary.loadReason === "string", "Includes load recommendation string");

console.log("attendancePrediction tests passed ✓");
