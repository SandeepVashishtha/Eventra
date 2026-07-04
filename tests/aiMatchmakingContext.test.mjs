import assert from "node:assert/strict";
import {
  fetchRecommendedConnections,
  suggestMeetingSlots,
} from "../src/utils/aiMatchmaking.js";

const reactMatches = await fetchRecommendedConnections(
  { id: "user-a", skills: ["React"] },
  "react-summit",
);
const designMatches = await fetchRecommendedConnections(
  { id: "user-b", skills: ["UI/UX"] },
  "design-week",
);

assert.notDeepEqual(reactMatches, designMatches);
assert.ok(reactMatches[0].matchReason.includes("react-summit"));
assert.ok(designMatches[0].matchReason.includes("design-week"));

const mondaySlots = suggestMeetingSlots(
  { id: "user-a" },
  { id: "user-b" },
  "2026-06-08",
);
const tuesdaySlots = suggestMeetingSlots(
  { id: "user-a" },
  { id: "user-b" },
  "2026-06-09",
);

assert.notDeepEqual(mondaySlots, tuesdaySlots);

console.log("contextual AI matchmaking tests passed");
