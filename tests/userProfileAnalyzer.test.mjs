import assert from "node:assert/strict";

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; }
};

// Import after mocking localStorage
import { getUserProfile } from "../src/utils/userProfileAnalyzer.js";

// Test 1: Fallback when localStorage is completely empty
global.localStorage.clear();
const resultEmpty = getUserProfile();
assert.deepEqual(resultEmpty.interests, [], "empty interests array fallback");
assert.deepEqual(resultEmpty.techStack, [], "empty techStack array fallback");
assert.deepEqual(resultEmpty.eventTypes, [], "empty eventTypes array fallback");
assert.equal(resultEmpty.level, "Beginner", "default level is Beginner");

// Test 2: Valid localStorage retrieval
const validProfile = {
  interests: ["Hackathons", "AI/ML"],
  techStack: ["React", "Python"],
  eventTypes: ["Conference", "Workshop"],
  level: "Advanced"
};
global.localStorage.setItem("eventra_user_profile", JSON.stringify(validProfile));

const resultValid = getUserProfile();
assert.deepEqual(resultValid.interests, ["Hackathons", "AI/ML"], "correctly loads interests");
assert.deepEqual(resultValid.techStack, ["React", "Python"], "correctly loads techStack");
assert.deepEqual(resultValid.eventTypes, ["Conference", "Workshop"], "correctly loads eventTypes");
assert.equal(resultValid.level, "Advanced", "correctly loads level");

// Test 3: Partial object in localStorage (e.g. only interests and level)
const partialProfile = {
  interests: ["Design"],
  level: "Intermediate"
};
global.localStorage.setItem("eventra_user_profile", JSON.stringify(partialProfile));

const resultPartial = getUserProfile();
assert.deepEqual(resultPartial.interests, ["Design"], "loads interests");
assert.deepEqual(resultPartial.techStack, [], "techStack falls back to empty array");
assert.deepEqual(resultPartial.eventTypes, [], "eventTypes falls back to empty array");
assert.equal(resultPartial.level, "Intermediate", "loads level");

console.log("userProfileAnalyzer tests passed ✓");
