import assert from "node:assert/strict";
import {
  applyMaximalMarginalRelevance,
  applyTimeDecay,
  buildInteractionProfile,
  buildPersonalizedRecommendations,
  calculateDiversitySimilarity,
  calculateRecommendationScore,
  calculateTemporalUrgencyScore,
  getTrendingEventsForArea,
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

const localTrending = getTrendingEventsForArea(events, "San Francisco", 2);
assert.equal(localTrending[0].id, 1);
assert(localTrending.every((event) => typeof event.trendingScore === "number"));

// ===========================================================================
// Time decay (e^(-lambda * age), half-life = 14 days by default)
// ===========================================================================

const NOW = Date.now();
const DAY_MS = 1000 * 60 * 60 * 24;

assert(Math.abs(applyTimeDecay(new Date(NOW - 1000)) - 1) < 0.01, "recent interaction should have ~full weight");
assert(Math.abs(applyTimeDecay(new Date(NOW - 14 * DAY_MS)) - 0.5) < 0.02, "interaction at half-life should decay to ~0.5");
assert(Math.abs(applyTimeDecay(new Date(NOW - 28 * DAY_MS)) - 0.25) < 0.02, "interaction at two half-lives should decay to ~0.25");
assert(Math.abs(applyTimeDecay(new Date(NOW + 5 * DAY_MS)) - 1) < 0.01, "future timestamps should be treated as full weight");
assert.equal(applyTimeDecay(null), 1, "missing timestamps should not decay");
assert.equal(applyTimeDecay("not-a-date"), 1, "invalid timestamps should not decay");

// Decay feeds into interaction weights
const decayedProfile = buildInteractionProfile({
  viewedEvents: [{ ...events[0], createdAt: new Date(NOW - 14 * DAY_MS).toISOString() }],
});
assert(
  Math.abs(decayedProfile.categories["web development"] - 1 * 0.5) < 0.02,
  "decay factor should scale interaction weights",
);

// Interactions without a timestamp must default to full recency, never the event date
const pastEvent = { ...events[2], date: new Date(NOW - 30 * DAY_MS).toISOString() };
const noTimestampProfile = buildInteractionProfile({
  viewedEvents: [{ ...pastEvent }],
});
assert.equal(
  noTimestampProfile.categories["devops and cloud"],
  1,
  "interaction without its own timestamp should keep full weight instead of decaying against the event date",
);

// A freshly-viewed future event keeps a high category weight
const futureEvent = { ...events[2], date: new Date(NOW + 30 * DAY_MS).toISOString() };
const freshProfile = buildInteractionProfile({
  viewedEvents: [{ ...futureEvent, createdAt: new Date(NOW - 1000).toISOString() }],
});
assert(
  Math.abs(freshProfile.categories["devops and cloud"] - 1) < 0.01,
  "freshly-viewed event should keep full category weight",
);

// ===========================================================================
// Temporal urgency & expiration filtering
// ===========================================================================

assert(
  calculateTemporalUrgencyScore(new Date(NOW - 7 * DAY_MS)).isExpired === true,
  "past events should be flagged as expired",
);
assert(
  calculateTemporalUrgencyScore(new Date(NOW - 7 * DAY_MS)).score === 0,
  "expired events should score 0 for urgency",
);
assert.equal(
  calculateTemporalUrgencyScore(new Date(NOW + 60 * 60 * 1000)).score,
  10,
  "events starting within 24h should get the max urgency score",
);
assert(
  calculateTemporalUrgencyScore(new Date(NOW + 7 * DAY_MS)).score > 0,
  "events starting within 1-14 days should get a proximity boost",
);
assert(
  calculateTemporalUrgencyScore(new Date(NOW + 7 * DAY_MS)).score < 10,
  "events further out should get a smaller proximity boost",
);
assert.equal(
  calculateTemporalUrgencyScore(new Date(NOW + 30 * DAY_MS)).score,
  2,
  "distant upcoming events should keep a small baseline score",
);

// Expired events are excluded from recommendation results
const expiredEvent = { ...events[1], id: 99, date: new Date(NOW - 2 * DAY_MS).toISOString() };
const expiredScore = calculateRecommendationScore(expiredEvent, {}, {});
assert.equal(expiredScore.score, 0, "expired events should be excluded from scoring");
assert.equal(expiredScore.isExpired, true, "expired events should be flagged");

// ===========================================================================
// MMR diversity re-ranking
// ===========================================================================

const makeScored = (id, category, tags, score) => ({
  id,
  category,
  title: id,
  tags,
  recommendationScore: score,
});
const homogenous = [
  makeScored("a", "Web", ["React", "JS"], 100),
  makeScored("b", "Web", ["React", "JS"], 100),
  makeScored("c", "AI", ["Python"], 100),
  makeScored("d", "Cloud", ["K8s"], 100),
];

const diverse = applyMaximalMarginalRelevance(homogenous, 0.7, 4);
assert.equal(diverse.length, 4, "MMR should return up to the requested limit");
assert.equal(diverse[0].id, "a", "highest relevance item should come first");
assert(
  diverse[1].id !== "b",
  "MMR should prefer a diverse second item over a redundant duplicate",
);
assert(
  diverse[3].id === "b",
  "the redundant duplicate should be pushed to the end by diversity re-ranking",
);

const relevanceOnly = applyMaximalMarginalRelevance(homogenous, 1.0, 4);
assert.equal(relevanceOnly[0].id, "a", "lambda=1.0 keeps pure relevance ordering");

const bounded = applyMaximalMarginalRelevance(homogenous, 0.7, 2);
assert.equal(bounded.length, 2, "MMR should respect the limit");

// Diversity distance between similar vs dissimilar events
const same = calculateDiversitySimilarity(
  makeScored("a", "Web", ["React", "JS"], 100),
  makeScored("b", "Web", ["React", "JS"], 100),
);
const different = calculateDiversitySimilarity(
  makeScored("a", "Web", ["React", "JS"], 100),
  makeScored("d", "Cloud", ["K8s"], 100),
);
assert(same > different, "similar events should have a higher diversity distance than unrelated ones");
assert(different === 0, "unrelated events should have zero similarity");

// ===========================================================================
// Cold-start fallback: no interaction history -> popularity/trending path
// ===========================================================================

const coldStart = buildPersonalizedRecommendations({
  events,
  userProfile: { interests: ["AI & Machine Learning"] },
  registeredEvents: [],
  bookmarkedEvents: [],
  viewedEvents: [],
  location: "",
});
assert(coldStart.length > 0, "cold-start users should still receive recommendations");
assert(
  coldStart.every((event) => event.recommendationScore > 0),
  "cold-start recommendations should all be positively scored",
);

console.log("recommendationEngine tests passed ✓");
