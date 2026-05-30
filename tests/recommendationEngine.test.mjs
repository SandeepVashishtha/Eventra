import assert from "node:assert/strict";
import { calculateRecommendationScore } from "../src/utils/recommendationEngine.js";

// Helper to check if array contains reasons
const hasReason = (reasons, expectedReason) => reasons.includes(expectedReason);

// Test empty matching
const userEmpty = {
  interests: [],
  techStack: [],
  eventTypes: [],
  level: "Intermediate"
};
const eventEmpty = {
  category: "Web Development",
  techStack: ["React"],
  type: "Hackathon",
  level: "Beginner",
  trending: false
};

const resultEmpty = calculateRecommendationScore(eventEmpty, userEmpty);
assert.equal(resultEmpty.score, 0, "No matches returns 0 score");
assert.equal(resultEmpty.reasons.length, 0, "No matches has empty reasons");

// Test Category Match (+30)
const userCategory = { interests: ["Design"], level: "Intermediate" };
const eventCategory = { category: "Design", level: "Beginner" };
const resultCategory = calculateRecommendationScore(eventCategory, userCategory);
assert.equal(resultCategory.score, 30, "Category match score is 30");
assert.ok(hasReason(resultCategory.reasons, "Matches your interests"), "Has matches your interests reason");

// Test Tech Stack Match (+25)
const userTech = { techStack: ["React", "Node"], level: "Intermediate" };
const eventTech = { techStack: ["React"], level: "Beginner" };
const resultTech = calculateRecommendationScore(eventTech, userTech);
assert.equal(resultTech.score, 25, "Tech stack match score is 25");
assert.ok(hasReason(resultTech.reasons, "Relevant to your tech stack"), "Has tech stack reason");

// Test Event Type Match (+20)
const userType = { eventTypes: ["Webinar"], level: "Intermediate" };
const eventType = { type: "Webinar", level: "Beginner" };
const resultType = calculateRecommendationScore(eventType, userType);
assert.equal(resultType.score, 20, "Event type match score is 20");
assert.ok(hasReason(resultType.reasons, "Preferred event type"), "Has preferred type reason");

// Test Level Match (+15)
const userLevel = { level: "Advanced" };
const eventLevel = { level: "Advanced" };
const resultLevel = calculateRecommendationScore(eventLevel, userLevel);
assert.equal(resultLevel.score, 15, "Level match score is 15");
assert.ok(hasReason(resultLevel.reasons, "Matches your experience level"), "Has experience level reason");

// Test Trending Bonus (+10)
const userTrending = { level: "Intermediate" };
const eventTrending = { trending: true, level: "Beginner" };
const resultTrending = calculateRecommendationScore(eventTrending, userTrending);
assert.equal(resultTrending.score, 10, "Trending bonus is 10");
assert.ok(hasReason(resultTrending.reasons, "Trending among developers"), "Has trending reason");

// Test Combined Match (Category + Tech + Level + Trending: 30 + 25 + 15 + 10 = 80)
const userCombined = {
  interests: ["Security"],
  techStack: ["Rust", "C++"],
  eventTypes: ["Conference"],
  level: "Expert"
};
const eventCombined = {
  category: "Security",
  techStack: ["Rust"],
  type: "Workshop", // no match here
  level: "Expert",
  trending: true
};
const resultCombined = calculateRecommendationScore(eventCombined, userCombined);
assert.equal(resultCombined.score, 80, "Combined matching adds up to 80");
assert.equal(resultCombined.reasons.length, 4, "Should have 4 reasons");

console.log("recommendationEngine tests passed ✓");
