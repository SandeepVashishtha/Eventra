import assert from "node:assert/strict";
import { computeAttendancePrediction } from "../src/utils/attendancePrediction.js";

const res = computeAttendancePrediction({}, {});
assert.equal(res.attendanceProbability, 53);
assert.equal(res.confidenceLabel, "Very low confidence");
console.log("attendancePrediction edge tests passed ✓");
