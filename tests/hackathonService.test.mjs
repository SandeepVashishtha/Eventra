import assert from "node:assert/strict";
import { normalizeHackathon } from "../src/services/hackathonService.js";

// 1. Basic normalization with defaults
const rawItem = {
  id: "hack_123",
  title: "AI Innovation Challenge",
  prizePool: 10000,
  tags: ["AI", "Python"],
  startDate: "2026-01-01T00:00:00.000Z",
  endDate: "2026-01-03T00:00:00.000Z",
};

const normalized = normalizeHackathon(rawItem, 0);

assert.equal(normalized.id, "hack_123");
assert.equal(normalized.title, "AI Innovation Challenge");
assert.equal(normalized.prizePool, 10000);
assert.equal(normalized.prize, "$10,000");
assert.equal(normalized.date, "2026-01-01T00:00:00.000Z");
assert.deepEqual(normalized.techStack, ["AI", "Python"]);
assert.equal(normalized.status, "completed");

// 2. Status mapping: ongoing -> live, ended -> completed
const ongoingItem = normalizeHackathon({ ...rawItem, status: "ongoing" }, 1);
assert.equal(ongoingItem.status, "live");

const endedItem = normalizeHackathon({ ...rawItem, status: "ended" }, 2);
assert.equal(endedItem.status, "completed");

if (process.env.NODE_ENV === "development") {
  console.log("hackathonService normalizeHackathon tests passed");
}
