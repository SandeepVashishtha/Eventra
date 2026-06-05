import assert from "node:assert/strict";
import {
  buildInteractionProfile,
  buildPersonalizedRecommendations,
  calculateRecommendationScore,
  getRecommendationTagCacheStats,
  getTrendingEventsForArea,
  resetRecommendationTagCache,
} from "../src/utils/recommendationEngine.js";

const events = [
  {
    id: 1,
    title: "React Conference",
    category: "Web Development",
    type: "conference",
    level: "Intermediate",
    tags: ["React", "Frontend"],
    location: "San Francisco, CA",
    attendees: 250,
    maxAttendees: 300,
  },
  {
    id: 2,
    title: "AI Workshop",
    category: "AI & Machine Learning",
    type: "workshop",
    level: "Beginner",
    tags: ["AI", "Python"],
    location: "Online",
    attendees: 120,
    maxAttendees: 150,
  },
  {
    id: 3,
    title: "Cloud Summit",
    category: "DevOps & Cloud",
    type: "summit",
    level: "Advanced",
    tags: ["Cloud", "Kubernetes"],
    location: "Austin, TX",
    attendees: 450,
    maxAttendees: 500,
  },
];

const emptyResult = calculateRecommendationScore({}, {});
assert.equal(emptyResult.score, 0, "empty events should not get accidental level matches");
assert.deepEqual(emptyResult.reasons, []);

const profileScore = calculateRecommendationScore(events[1], {
  interests: ["AI & Machine Learning"],
  eventTypes: ["workshop"],
  techStack: ["Python"],
  level: "Beginner",
});
assert(profileScore.score > 40, "profile matches should create a meaningful score");
assert(profileScore.reasons.includes("Matches your saved interests"));
assert(profileScore.reasons.includes("Relevant to your tech stack"));

const interactions = buildInteractionProfile({
  registeredEvents: [events[0]],
  bookmarkedEvents: [events[1]],
  viewedEvents: [events[1]],
  location: "San Francisco",
});
assert.equal(interactions.categories["web development"], 4);
assert.equal(interactions.categories["ai and machine learning"], 4);
assert(interactions.tags.react > 0);

const collaborativeScore = calculateRecommendationScore(
  { ...events[0], id: 10 },
  {},
  interactions,
);
assert(
  collaborativeScore.reasons.includes("Similar to events in your activity history"),
  "similar events should receive collaborative filtering reasons",
);

const recommendations = buildPersonalizedRecommendations({
  events,
  userProfile: { interests: ["AI & Machine Learning"] },
  registeredEvents: [events[0]],
  bookmarkedEvents: [events[1]],
  viewedEvents: [],
  location: "San Francisco",
});
assert(!recommendations.some((event) => event.id === 1), "registered events should be excluded");
assert.equal(recommendations[0].id, 2, "bookmarked/category-matching event should rank first");
assert(recommendations[0].recommendationReasons.length > 0);

resetRecommendationTagCache();
buildPersonalizedRecommendations({
  events,
  registeredEvents: [events[0]],
  bookmarkedEvents: [events[1]],
});
const firstCacheStats = getRecommendationTagCacheStats();
assert.deepEqual(
  firstCacheStats.keys,
  ["1", "2"],
  "first recommendation build should cache interacted event tags",
);

buildPersonalizedRecommendations({
  events,
  registeredEvents: [events[0]],
  bookmarkedEvents: [events[1]],
});
assert.deepEqual(
  getRecommendationTagCacheStats(),
  firstCacheStats,
  "subsequent builds should reuse the tag cache instead of clearing it",
);

const localTrending = getTrendingEventsForArea(events, "San Francisco", 2);
assert.equal(localTrending[0].id, 1);
assert(localTrending.every((event) => typeof event.trendingScore === "number"));

console.log("recommendationEngine tests passed ✓");
