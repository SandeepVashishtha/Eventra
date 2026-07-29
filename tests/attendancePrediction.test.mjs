import assert from "node:assert/strict";
import {
  computeAttendancePrediction,
  buildWaitlistPromotionSummary,
  getPredictedAttendanceSummary
} from "../src/utils/attendancePrediction.js";

try {
  // Test Case 1: computeAttendancePrediction with empty/default inputs
  const p1 = computeAttendancePrediction();
  assert.equal(typeof p1.attendanceProbability, "number");
  assert.equal(typeof p1.noShowProbability, "number");
  assert.equal(p1.predictedAttendees, 0);
  assert.equal(p1.recommendedPromotions, 0);
  assert.equal(p1.projectedFillRate, 0);
  assert.equal(p1.waitlistSize, 0);

  // Test Case 2: computeAttendancePrediction with custom event details
  const mockEvent = {
    title: "Awesome React Workshop",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    maxAttendees: 100,
    attendees: 80,
    price: 0, // Free event
    eventMode: "online",
    trending: true,
    waitlistCount: 20
  };

  const p2 = computeAttendancePrediction(mockEvent, { reminders: [1, 2] });
  assert(p2.attendanceProbability > 50, "Should have healthy attendance probability for online, free, trending event with reminders");
  assert(p2.predictedAttendees > 0, "Should estimate non-zero attendees");
  assert.equal(p2.waitlistSize, 20);

  // Test Case 3: buildWaitlistPromotionSummary when no waitlist or capacity exists
  const summary1 = buildWaitlistPromotionSummary();
  assert.equal(summary1.summary, "No waitlist data available.");
  assert.deepEqual(summary1.actions, []);
  assert.equal(summary1.seatsToPromote, 0);

  // Test Case 4: buildWaitlistPromotionSummary with active waitlist and capacity
  const summary2 = buildWaitlistPromotionSummary(mockEvent, { reminders: [1, 2] });
  assert(summary2.seatsToPromote >= 0);
  assert(summary2.summary.length > 0);
  assert(summary2.actions.length > 0);

  // Test Case 5: getPredictedAttendanceSummary formatting
  const predSummary = getPredictedAttendanceSummary(mockEvent, { reminders: [1, 2] });
  assert.equal(predSummary.title, mockEvent.title);
  assert.equal(typeof predSummary.attendanceProbability, "number");
  assert.equal(typeof predSummary.confidenceLabel, "string");
  assert(predSummary.loadReason.length > 0);

  console.log("attendancePrediction tests passed ✓");
} catch (error) {
  console.error("Test failed:", error);
  process.exit(1);
}
