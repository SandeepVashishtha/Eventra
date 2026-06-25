import assert from "node:assert/strict";

const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => {
    store[key] = String(val);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  }
};

const { getUserProfile } = await import("../src/utils/userProfileAnalyzer.js");

try {
  // Test Case 1: Empty localStorage returns default user profile structure
  localStorage.clear();
  const profile1 = getUserProfile();
  assert.deepEqual(profile1, {
    interests: [],
    techStack: [],
    eventTypes: [],
    level: "Beginner"
  }, "Should return default beginner profile when localStorage is empty");

  // Test Case 2: Correctly parsed profile when populated with partial values
  localStorage.setItem("eventra_user_profile", JSON.stringify({
    interests: ["Web3"],
    level: "Intermediate"
  }));
  
  const profile2 = getUserProfile();
  assert.deepEqual(profile2, {
    interests: ["Web3"],
    techStack: [],
    eventTypes: [],
    level: "Intermediate"
  }, "Should merge and fallback correctly for partial stored profile");

  // Test Case 3: Correctly parsed profile when fully populated
  localStorage.setItem("eventra_user_profile", JSON.stringify({
    interests: ["React", "AI"],
    techStack: ["JavaScript", "Python"],
    eventTypes: ["Hackathon", "Conference"],
    level: "Advanced"
  }));

  const profile3 = getUserProfile();
  assert.deepEqual(profile3, {
    interests: ["React", "AI"],
    techStack: ["JavaScript", "Python"],
    eventTypes: ["Hackathon", "Conference"],
    level: "Advanced"
  }, "Should parse fully populated profile accurately");

  // Test Case 4: Invalid JSON string in localStorage returns default profile gracefully
  localStorage.setItem("eventra_user_profile", "invalid-json-string");
  const profile4 = getUserProfile();
  assert.deepEqual(profile4, {
    interests: [],
    techStack: [],
    eventTypes: [],
    level: "Beginner"
  }, "Should return default beginner profile if JSON is corrupted");

  console.log("userProfileAnalyzer tests passed ✓");
} finally {
  delete global.localStorage;
}
