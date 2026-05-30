import assert from "node:assert/strict";

const { calculateRecommendationScore } = await import(
  "../src/utils/recommendationEngine.js"
);

const profile = {
  interests: ["AI"],
  techStack: ["React"],
  eventTypes: ["Hackathon"],
  level: "Intermediate",
};

const event = {
  category: "AI",
  techStack: ["React", "Node"],
  type: "Hackathon",
  level: "Intermediate",
  trending: true,
};

const result = calculateRecommendationScore(event, profile);
assert.equal(result.score, 100, "accumulates all matching score bonuses");
assert.deepEqual(result.reasons, [
  "Matches your interests",
  "Relevant to your tech stack",
  "Preferred event type",
  "Matches your experience level",
  "Trending among developers",
]);

const partial = calculateRecommendationScore(
  { category: "Design", trending: false },
  profile
);
assert.equal(partial.score, 0, "returns zero when nothing matches");
assert.deepEqual(partial.reasons, [], "returns no reasons when nothing matches");

console.log("recommendationEngine tests passed ✓");
