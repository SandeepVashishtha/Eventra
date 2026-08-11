import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateAttendeeNoShowProbability,
  predictEventTurnout,
} from "../src/utils/attendancePrediction.js";

describe("Predictive ML Attendance & No-Show Calculator Tests", () => {
  it("should calculate individual attendee no-show probability", () => {
    const highTurnoutUser = {
      pastAttendanceRatio: 0.95,
      daysRegisteredBeforeEvent: 20,
      profileCompleteness: 100,
      badgeCount: 5,
      isLocalResident: true,
    };

    const prob = calculateAttendeeNoShowProbability(highTurnoutUser);
    assert.ok(prob >= 0 && prob <= 0.3, "High engagement attendee should have low no-show probability");
  });

  it("should aggregate overall event turnout predictions", () => {
    const sampleRegistrations = [
      { pastAttendanceRatio: 0.9, daysRegisteredBeforeEvent: 14, profileCompleteness: 90, badgeCount: 3, isLocalResident: true },
      { pastAttendanceRatio: 0.3, daysRegisteredBeforeEvent: 1, profileCompleteness: 40, badgeCount: 0, isLocalResident: false },
      { pastAttendanceRatio: 0.8, daysRegisteredBeforeEvent: 10, profileCompleteness: 85, badgeCount: 2, isLocalResident: true },
    ];

    const stats = predictEventTurnout(sampleRegistrations);
    assert.equal(stats.totalRegistered, 3);
    assert.ok(stats.predictedTurnout > 0);
    assert.ok(stats.recommendedOverbookingCapacity >= stats.totalRegistered);
  });
});
