import assert from "node:assert/strict";

const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
};

const { getUserProfile } = await import("../src/utils/userProfileAnalyzer.js");

const emptyProfile = getUserProfile();
assert.deepEqual(emptyProfile.interests, [], "defaults interests to empty array");
assert.deepEqual(emptyProfile.techStack, [], "defaults techStack to empty array");
assert.deepEqual(emptyProfile.eventTypes, [], "defaults eventTypes to empty array");
assert.equal(emptyProfile.level, "Beginner", "defaults level to Beginner");

localStorage.setItem(
  "eventra_user_profile",
  JSON.stringify({
    interests: ["ai"],
    techStack: ["react"],
    eventTypes: ["hackathon"],
    level: "Advanced",
  })
);

assert.deepEqual(getUserProfile(), {
  interests: ["ai"],
  techStack: ["react"],
  eventTypes: ["hackathon"],
  level: "Advanced",
}, "loads saved profile fields from localStorage");

console.log("userProfileAnalyzer tests passed ✓");
