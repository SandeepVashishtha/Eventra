import assert from "node:assert/strict";
import { parseTimeToMinutes, validateCoordinates } from "../src/utils/eventCreationUtils.js";

assert.equal(parseTimeToMinutes("02:30"), 150);
assert.equal(parseTimeToMinutes(""), 0);

const coords = validateCoordinates("45.5", "-122.5");
assert.equal(coords.latitude, 45.5);
assert.equal(coords.longitude, -122.5);

console.log("eventCreationUtils edge tests passed ✓");
