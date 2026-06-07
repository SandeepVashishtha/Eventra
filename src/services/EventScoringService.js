import {
  buildPersonalizedRecommendations,
  calculateRecommendationScore,
  getTrendingEventsForArea,
  buildInteractionProfile,
} from "../utils/recommendationEngine";
import { buildUserInterestProfile } from "../utils/UserInterestTracker";

const DEFAULT_LIMIT = 8;

export const scoreEvent = (event, options = {}) => {
  const { userProfile, interactionProfile, interactions } = options;

  const profile =
    userProfile ||
    interactions?.preferences ||
    buildUserInterestProfile().preferences;

  const profileInteractions =
    interactionProfile ||
    interactions?.interactionProfile ||
    buildInteractionProfile(
      interactions || buildUserInterestProfile().interactions
    );

  return calculateRecommendationScore(event, profile, profileInteractions);
};

export const scoreEvents = (events = [], options = {}) =>
  events.map((event) => {
    const result = scoreEvent(event, options);
    return {
      ...event,
      recommendationScore: result.score,
      recommendationReasons: result.reasons,
      scoreBreakdown: result.breakdown,
    };
  });

export const getPersonalizedEventScores = ({
  events = [],
  hackathons = [],
  limit = DEFAULT_LIMIT,
  includeInteracted = false,
  userProfile,
  interactions,
} = {}) => {
  const interestData = interactions
    ? { preferences: userProfile, ...interactions }
    : buildUserInterestProfile();

  const profile = userProfile || interestData.preferences;
  const stored = interestData.interactions || interestData;

  const scoredEvents = buildPersonalizedRecommendations({
    events,
    userProfile: profile,
    registeredEvents: stored.registeredEvents || [],
    bookmarkedEvents: stored.bookmarkedEvents || [],
    viewedEvents: stored.viewedEvents || [],
    location: profile.location || "",
    includeInteracted,
    limit,
  }).map((item) => ({ ...item, itemType: "event" }));

  const scoredHackathons = buildPersonalizedRecommendations({
    events: hackathons,
    userProfile: profile,
    registeredEvents: stored.hackathonParticipation || [],
    bookmarkedEvents: stored.bookmarkedEvents || [],
    viewedEvents: stored.viewedEvents || [],
    location: profile.location || "",
    includeInteracted,
    limit: Math.ceil(limit / 2),
  }).map((item) => ({ ...item, itemType: "hackathon" }));

  return [...scoredEvents, ...scoredHackathons]
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
};

export const getTrendingRecommendations = ({
  events = [],
  location = "",
  limit = 6,
} = {}) => {
  const { preferences } = buildUserInterestProfile();
  return getTrendingEventsForArea(
    events,
    location || preferences.location || "",
    limit
  ).map((event) => ({
    ...event,
    itemType: "event",
    recommendationScore: event.trendingScore || 0,
    recommendationReasons: ["Trending on Eventra"],
  }));
};
