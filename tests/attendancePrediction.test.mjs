import assert from "node:assert/strict";

let now = Date.parse("2026-06-01T12:00:00.000Z");
const OriginalDate = global.Date;
class MockDate extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super(now);
      return;
    }
    super(...args);
  }

  static now() {
    return now;
  }
}
global.Date = MockDate;

const {
  computeAttendancePrediction,
  buildWaitlistPromotionSummary,
  getPredictedAttendanceSummary,
} = await import("../src/utils/attendancePrediction.js");

try {
  const event = {
    title: "Launch Night",
    startDate: "2026-06-03T18:00:00.000Z",
    registrationDate: "2026-05-01T00:00:00.000Z",
    maxAttendees: 100,
    attendees: 70,
    price: 0,
    eventMode: "online",
    waitlistCount: 8,
    pastAttendanceRate: 0.9,
    engagementScore: 0.85,
  };

  const prediction = computeAttendancePrediction(event, { reminders: [1, 2] });
  assert.ok(prediction.attendanceProbability >= 70, "returns a strong attendance probability");
  assert.ok(prediction.noShowProbability <= 30, "no-show probability complements attendance");
  assert.equal(typeof prediction.confidenceLabel, "string");
  assert.ok(prediction.predictedAttendees >= event.attendees - 5, "predicts attendee count near capacity");
  assert.equal(prediction.waitlistSize, 8);

  const promotion = buildWaitlistPromotionSummary(event, { reminders: [1, 2] });
  assert.ok(promotion.summary.length > 0);
  assert.ok(Array.isArray(promotion.actions));
  assert.ok(promotion.seatsToPromote >= 0);

  const summary = getPredictedAttendanceSummary(event, { reminders: [1, 2] });
  assert.equal(summary.title, "Launch Night");
  assert.equal(summary.attendanceProbability, prediction.attendanceProbability);
  assert.equal(summary.confidenceLabel, prediction.confidenceLabel);

  const emptyWaitlist = buildWaitlistPromotionSummary(
    { maxAttendees: 50, attendees: 40 },
    { reminders: [] }
  );
  assert.equal(emptyWaitlist.summary, "No waitlist data available.");
  assert.deepEqual(emptyWaitlist.actions, []);

  console.log("attendancePrediction tests passed ✓");
} finally {
  global.Date = OriginalDate;
}
