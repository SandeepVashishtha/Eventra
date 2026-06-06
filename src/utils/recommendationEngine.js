const MAX_SCORE = 100;

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const toTokens = (value) =>
  normalizeText(value).split(/\s+/).filter(Boolean);

const normalizeList = (value) => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => toTokens(item).length ? [normalizeText(item)] : [])
    .filter(Boolean);
};

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const getEventId = (event) => String(event?.id ?? event?.eventId ?? event?.title ?? "");

const unwrapEvent = (entry) => entry?.event || entry?.eventSummary || entry || {};

const getEventCategory = (event) => normalizeText(event?.category || event?.type);

const getEventType = (event) => normalizeText(event?.type);

const getEventTags = (event) =>
  unique([
    ...normalizeList(event?.tags),
    ...normalizeList(event?.techStack),
    ...toTokens(event?.title),
    ...toTokens(event?.description),
  ]);

const getLocationParts = (location) =>
  normalizeText(location)
    .split(/\s+/)
    .filter((part) => part.length > 1 && part !== "online");

const createLocationMatcher = (preferredLocation) => {
  const parts = getLocationParts(preferredLocation);
  if (parts.length === 0) return () => false;
  return (eventLocation) =>
    eventLocation && parts.some((part) => eventLocation.includes(part));
};

const buildLocationIndex = (preferredLocation) => {
  const parts = getLocationParts(preferredLocation);
  if (parts.length === 0) return null;
  return { parts, test: (loc) => parts.some((part) => loc.includes(part)) };
};

const getPopularityScore = (event) => {
  const attendees = Number(event?.attendees) || 0;
  const capacity = Number(event?.maxAttendees) || 0;

  if (capacity <= 0) return Math.min(attendees / 10, 10);
  return Math.min((attendees / capacity) * 10, 10);
};

const _tagCache = new Map();
const _cacheOrder = [];
const MAX_CACHE_SIZE = 100;

const _getCachedTags = (event) => {
  const id = getEventId(event);
  if (!id) return [];
  if (_tagCache.has(id)) {
    const tags = _tagCache.get(id);
    const idx = _cacheOrder.indexOf(id);
    if (idx > -1) _cacheOrder.splice(idx, 1);
    _cacheOrder.push(id);
    return tags;
  }
  if (_cacheOrder.length >= MAX_CACHE_SIZE) {
    const oldest = _cacheOrder.shift();
    _tagCache.delete(oldest);
  }
  const tags = getEventTags(event);
  _tagCache.set(id, tags);
  _cacheOrder.push(id);
  return tags;
};

const getSimilarityScore = (candidate, interactedEvents) => {
  if (!interactedEvents.length) return 0;

  const candidateCategory = getEventCategory(candidate);
  const candidateType = getEventType(candidate);
  const candidateTags = new Set(getEventTags(candidate));

  const best = interactedEvents.reduce((bestScore, entry) => {
    const event = unwrapEvent(entry);
    let score = 0;

    if (candidateCategory && candidateCategory === getEventCategory(event)) {
      score += 12;
    }

    if (candidateType && candidateType === getEventType(event)) {
      score += 5;
    }

    const overlap = _getCachedTags(event).filter((tag) => candidateTags.has(tag));
    score += Math.min(overlap.length * 3, 12);

    return Math.max(bestScore, score);
  }, 0);

  return Math.min(best, 25);
};

export const buildInteractionProfile = ({
  registeredEvents = [],
  bookmarkedEvents = [],
  viewedEvents = [],
  location = "",
} = {}) => {
  const weightedEvents = [
    ...registeredEvents.map((entry) => ({ entry, weight: 4 })),
    ...bookmarkedEvents.map((entry) => ({ entry, weight: 3 })),
    ...viewedEvents.map((entry) => ({ entry, weight: 1 })),
  ];

  const categoryWeights = {};
  const typeWeights = {};
  const tagWeights = {};
  const locationCounts = {};
  const interactedIds = new Set();
  const registeredIds = new Set();

  weightedEvents.forEach(({ entry, weight }) => {
    const event = unwrapEvent(entry);
    const id = getEventId(event);
    const category = getEventCategory(event);
    const type = getEventType(event);
    const eventLocation = normalizeText(event.location);

    if (id) interactedIds.add(id);
    if (category) categoryWeights[category] = (categoryWeights[category] || 0) + weight;
    if (type) typeWeights[type] = (typeWeights[type] || 0) + weight;
    if (eventLocation && eventLocation !== "online") {
      locationCounts[eventLocation] = (locationCounts[eventLocation] || 0) + weight;
    }

    getEventTags(event).forEach((tag) => {
      tagWeights[tag] = (tagWeights[tag] || 0) + weight;
    });
  });

  registeredEvents.forEach((entry) => {
    const id = getEventId(unwrapEvent(entry));
    if (id) registeredIds.add(id);
  });

  const topLocation =
    location ||
    Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "";

  return {
    categories: categoryWeights,
    types: typeWeights,
    tags: tagWeights,
    interactedEvents: weightedEvents.map(({ entry }) => unwrapEvent(entry)),
    interactedIds,
    registeredIds,
    location: topLocation,
  };
};

export const calculateRecommendationScore = (
  event,
  userProfile = {},
  interactions = {},
) => {
  if (!event || typeof event !== "object") {
    return { score: 0, reasons: [], breakdown: [] };
  }

  const interactionProfile = interactions.categories
    ? interactions
    : buildInteractionProfile(interactions);

  let score = 0;
  const reasons = [];
  const breakdown = [];

  const addScore = (label, points, reason) => {
    if (points <= 0) return;
    score += points;
    breakdown.push({ label, score: Math.round(points) });
    if (reason) reasons.push(reason);
  };

  const category = getEventCategory(event);
  const type = getEventType(event);
  const eventTags = getEventTags(event);
  const profileInterests = normalizeList(userProfile.interests);
  const profileTypes = normalizeList(userProfile.eventTypes);
  const profileTech = normalizeList(userProfile.techStack);
  const profileLevel = normalizeText(userProfile.level);
  const eventLevel = normalizeText(event.level);

  if (profileInterests.includes(category)) {
    addScore("Profile interest match", 18, "Matches your saved interests");
  }

  if (profileTypes.includes(type)) {
    addScore("Preferred event type", 10, "Fits your preferred event format");
  }

  const profileTechSet = new Set(profileTech);
  const techOverlap = eventTags.filter((tag) => profileTechSet.has(tag));
  addScore(
    "Tech stack overlap",
    Math.min(techOverlap.length * 5, 12),
    "Relevant to your tech stack",
  );

  if (profileLevel && eventLevel && profileLevel === eventLevel) {
    addScore("Experience level fit", 6, "Matches your experience level");
  }

  const categoryAffinity = interactionProfile.categories?.[category] || 0;
  addScore(
    "Category affinity",
    Math.min(categoryAffinity * 4, 18),
    "Similar to categories you engage with",
  );

  const typeAffinity = interactionProfile.types?.[type] || 0;
  addScore(
    "Format affinity",
    Math.min(typeAffinity * 2, 8),
    "Similar to event formats you prefer",
  );

  const tagAffinity = eventTags.reduce(
    (sum, tag) => sum + (interactionProfile.tags?.[tag] || 0),
    0,
  );
  addScore(
    "Interaction tag overlap",
    Math.min(tagAffinity * 1.5, 12),
    "Shares topics with your bookmarks and views",
  );

  addScore(
    "Collaborative item similarity",
    getSimilarityScore(event, interactionProfile.interactedEvents || []),
    "Similar to events in your activity history",
  );

  const matchesArea = createLocationMatcher(interactionProfile.location);
  const localTrending = matchesArea(normalizeText(event?.location));
  if (localTrending) {
    addScore("Trending near you", Math.min(getPopularityScore(event) + 6, 15), "Popular in your area");
  } else if (event.trending || getPopularityScore(event) >= 8) {
    addScore("Platform trending", Math.min(getPopularityScore(event), 10), "Trending among Eventra users");
  }

  const cappedScore = Math.min(Math.round(score), MAX_SCORE);

  return {
    score: cappedScore,
    reasons: unique(reasons).slice(0, 5),
    breakdown,
  };
};

export const getTrendingEventsForArea = (events = [], location = "", limit = 4) => {
  const matchesArea = createLocationMatcher(location);
  return [...events]
    .filter((event) => matchesArea(normalizeText(event?.location)) || event.eventMode === "online")
    .map((event) => ({
      ...event,
      trendingScore: Math.round(getPopularityScore(event) * 10),
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
};

export const buildPersonalizedRecommendations = ({
  events = [],
  userProfile = {},
  registeredEvents = [],
  bookmarkedEvents = [],
  viewedEvents = [],
  location = "",
  includeInteracted = false,
  limit = 8,
} = {}) => {
  const interactionProfile = buildInteractionProfile({
    registeredEvents,
    bookmarkedEvents,
    viewedEvents,
    location,
  });

  return events
    .filter((event) => includeInteracted || !interactionProfile.registeredIds.has(getEventId(event)))
    .map((event) => {
      const result = calculateRecommendationScore(event, userProfile, interactionProfile);
      return {
        ...event,
        calculatedMatch: result.score,
        recommendationScore: result.score,
        recommendationReasons: result.reasons,
        breakdown: result.breakdown,
      };
    })
    .filter((event) => event.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
};
