import assert from "node:assert/strict";
import { calculateRecommendationScore } from "../src/utils/recommendationEngine.js";

try {
  // Test Case 1: Empty event and user profile returns score 15 because undefined === undefined matches level
  const res1 = calculateRecommendationScore({}, {});
  assert.equal(res1.score, 15, "Score should be 15 for empty objects due to undefined level match");
  assert.deepEqual(res1.reasons, ["Matches your experience level"], "Should match level because both are undefined");

  // Test Case 2: Category Match (Interest) - note: undefined level still matches, so score = 30 + 15 = 45
  const event2 = { category: "Web3" };
  const profile2 = { interests: ["Web3"] };
  const res2 = calculateRecommendationScore(event2, profile2);
  assert.equal(res2.score, 45);
  assert(res2.reasons.includes("Matches your interests"));
  assert(res2.reasons.includes("Matches your experience level"));

  // Test Case 3: Tech Stack Match
  const event3 = { techStack: ["React", "TypeScript"], level: "Beginner" };
  const profile3 = { techStack: ["React"], level: "Advanced" };
  const res3 = calculateRecommendationScore(event3, profile3);
  assert.equal(res3.score, 25);
  assert.deepEqual(res3.reasons, ["Relevant to your tech stack"]);

  // Test Case 4: Event Type Match
  const event4 = { type: "Hackathon", level: "Beginner" };
  const profile4 = { eventTypes: ["Hackathon"], level: "Advanced" };
  const res4 = calculateRecommendationScore(event4, profile4);
  assert.equal(res4.score, 20);
  assert.deepEqual(res4.reasons, ["Preferred event type"]);

  // Test Case 5: Experience Level Match
  const event5 = { level: "Intermediate" };
  const profile5 = { level: "Intermediate" };
  const res5 = calculateRecommendationScore(event5, profile5);
  assert.equal(res5.score, 15);
  assert.deepEqual(res5.reasons, ["Matches your experience level"]);

  // Test Case 6: Trending Bonus
  const event6 = { trending: true, level: "Beginner" };
  const profile6 = { level: "Advanced" };
  const res6 = calculateRecommendationScore(event6, profile6);
  assert.equal(res6.score, 10);
  assert.deepEqual(res6.reasons, ["Trending among developers"]);

  // Test Case 7: All combined matches
  const eventAll = {
    category: "AI",
    techStack: ["Python", "Tensorflow"],
    type: "Conference",
    level: "Advanced",
    trending: true
  };
  const profileAll = {
    interests: ["AI", "Cloud"],
    techStack: ["Python"],
    eventTypes: ["Conference"],
    level: "Advanced"
  };
  const resAll = calculateRecommendationScore(eventAll, profileAll);
  assert.equal(resAll.score, 100, "Perfect match should compute score of 100");
  assert.equal(resAll.reasons.length, 5);
  assert(resAll.reasons.includes("Matches your interests"));
  assert(resAll.reasons.includes("Relevant to your tech stack"));
  assert(resAll.reasons.includes("Preferred event type"));
  assert(resAll.reasons.includes("Matches your experience level"));
  assert(resAll.reasons.includes("Trending among developers"));

  console.log("recommendationEngine tests passed ✓");
} catch (error) {
  console.error("Test failed:", error);
  process.exit(1);
}
