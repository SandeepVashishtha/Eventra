const MAX_SCORE = 100;
const DEFAULT_HALF_LIFE_DAYS = 14;

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
    .flatMap((item) => (toTokens(item).length ? [normalizeText(item)] : []))
    .filter(Boolean);
};

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const getEventId = (event) => {
  if (!event) return null;
  const id = event.id ?? event.eventId;
  if (id === undefined || id === null || id === "") return null;
  return String(id);
};

const unwrapEvent = (entry) => entry?.event || entry?.eventSummary || entry || {};

const getEventCategory = (event) => {
  if (event?.categories && Array.isArray(event.categories) && event.categories.length > 0) {
    return normalizeText(event.categories[0]);
  }
  return normalizeText(event?.category || event?.type);
};

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

const getPopularityScore = (event) => {
  const attendees = Number(event?.attendees) || 0;
  const capacity = Number(event?.maxAttendees) || 0;

  if (capacity <= 0) return Math.min(attendees / 10, 10);
  return Math.min((attendees / capacity) * 10, 10);
};

const _tagCache = new Map();
const _cacheOrder = [];
const MAX_CACHE_SIZE = 100;
const TAG_CACHE_TTL_MS = 5 * 60 * 1000;

const _getCachedTags = (event) => {
  // 🔥 FIX: Skip the cache entirely when the event has no real id.
  // Previously getEventId fell back to the event title, so two events with
  // the same title would collide on the same cache key and the last write
  // would win — silently corrupting similarity scores. Returning the tags
  // directly is correct here; the cache only exists to amortise work for
  // events we expect to be re-encountered, and id-less events are not.
  const id = getEventId(event);
  if (!id) return getEventTags(event);
  const cached = _tagCache.get(id);
  if (cached && Date.now() - cached.cachedAt <= TAG_CACHE_TTL_MS) {
    const idx = _cacheOrder.indexOf(id);
    if (idx > -1) _cacheOrder.splice(idx, 1);
    _cacheOrder.push(id);
    return cached.tags;
  }
  if (_cacheOrder.length >= MAX_CACHE_SIZE) {
    const oldest = _cacheOrder.shift();
    _tagCache.delete(oldest);
  }
  const tags = getEventTags(event);
  _tagCache.set(id, { tags, cachedAt: Date.now() });
  _cacheOrder.push(id);
  return tags;
};

/**
 * Clears the in-memory tag cache. Exported for tests and SSR resets so stale,
 * session-lifetime tag vectors are never served across users/requests.
 */
export const clearTagCache = () => {
  _tagCache.clear();
  _cacheOrder.length = 0;
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

// ===========================================================================
// ADVANCED ENGINE ADDITIONS: Time Decay, Temporal Urgency & MMR Diversity
// ===========================================================================

/**
 * Calculates exponential time decay factor: e^(-lambda * delta_t)
 * @param {string|number|Date} timestamp - Time of interaction
 * @param {number} [halfLifeDays=14] - Days after which weight halves
 * @returns {number} Multiplier between 0.0 and 1.0
 */
export const applyTimeDecay = (timestamp, halfLifeDays = DEFAULT_HALF_LIFE_DAYS) => {
  if (!timestamp) return 1.0;
  const timeMs = new Date(timestamp).getTime();
  if (Number.isNaN(timeMs)) return 1.0;

  const safeHalfLife = Number.isFinite(halfLifeDays) && halfLifeDays > 0
    ? halfLifeDays
    : DEFAULT_HALF_LIFE_DAYS;
  const ageInDays = Math.max(0, (Date.now() - timeMs) / (1000 * 60 * 60 * 24));
  const lambda = Math.LN2 / safeHalfLife;
  return Math.exp(-lambda * ageInDays);
};

/**
 * Computes urgency score based on event start proximity.
 * Filters expired events and rewards upcoming events within 1-14 days.
 * @param {string|Date} eventDate - Event start date/time
 * @returns {{ score: number, isExpired: boolean, reason: string }}
 */
export const calculateTemporalUrgencyScore = (eventDate) => {
  if (!eventDate) return { score: 0, isExpired: false, reason: "" };

  const startMs = new Date(eventDate).getTime();
  if (Number.isNaN(startMs)) return { score: 0, isExpired: false, reason: "" };

  const nowMs = Date.now();
  const diffDays = (startMs - nowMs) / (1000 * 60 * 60 * 24);

  // Expired event
  if (diffDays < -0.25) {
    return { score: 0, isExpired: true, reason: "Event has already passed" };
  }

  // Happening today / within 24h
  if (diffDays >= -0.25 && diffDays <= 1) {
    return { score: 10, isExpired: false, reason: "Starting within 24 hours" };
  }

  // Happening within 2 weeks
  if (diffDays <= 14) {
    const proximityScore = Math.round(10 * (1 - diffDays / 14));
    return { score: proximityScore, isExpired: false, reason: "Happening soon" };
  }

  return { score: 2, isExpired: false, reason: "Upcoming event" };
};

/**
 * Jaccard similarity distance between two events based on tags, categories, and locations.
 * Used for MMR diversity re-ranking.
 * @param {Object} eventA
 * @param {Object} eventB
 * @returns {number} Similarity score between 0.0 and 1.0
 */
export const calculateDiversitySimilarity = (eventA, eventB) => {
  const tagsA = new Set(getEventTags(eventA));
  const tagsB = new Set(getEventTags(eventB));

  if (tagsA.size === 0 || tagsB.size === 0) return 0;

  let intersection = 0;
  tagsA.forEach((tag) => {
    if (tagsB.has(tag)) intersection++;
  });

  const union = new Set([...tagsA, ...tagsB]).size;
  const jaccardTagSim = union > 0 ? intersection / union : 0;

  const categoryMatch = getEventCategory(eventA) === getEventCategory(eventB) ? 0.3 : 0;
  return Math.min(jaccardTagSim * 0.7 + categoryMatch, 1.0);
};

/**
 * Maximal Marginal Relevance (MMR) re-ranking algorithm.
 * Balances recommendation relevance with catalog diversity.
 * @param {Array} scoredEvents - List of pre-scored candidate events
 * @param {number} [lambda=0.7] - Balance parameter (1.0 = pure relevance, 0.0 = pure diversity)
 * @param {number} [limit=8] - Target count
 * @returns {Array} Re-ranked diverse event list
 */
export const applyMaximalMarginalRelevance = (scoredEvents = [], lambda = 0.7, limit = 8) => {
  if (scoredEvents.length <= 1) return scoredEvents.slice(0, limit);

  const selected = [];
  const unselected = [...scoredEvents];

  // Normalize initial recommendation scores to range [0, 1]
  const maxScore = Math.max(...scoredEvents.map((e) => e.recommendationScore), 1);

  while (selected.length < limit && unselected.length > 0) {
    let bestIndex = -1;
    let maxMMR = -Infinity;

    for (let i = 0; i < unselected.length; i++) {
      const candidate = unselected[i];
      const normScore = candidate.recommendationScore / maxScore;

      // Compute maximum similarity to already selected items
      let maxSimToSelected = 0;
      for (const sel of selected) {
        const sim = calculateDiversitySimilarity(candidate, sel);
        if (sim > maxSimToSelected) {
          maxSimToSelected = sim;
        }
      }

      // MMR equation: lambda * Relevance - (1 - lambda) * Redundancy
      const mmrScore = lambda * normScore - (1 - lambda) * maxSimToSelected;

      if (mmrScore > maxMMR) {
        maxMMR = mmrScore;
        bestIndex = i;
      }
    }

    if (bestIndex !== -1) {
      selected.push(unselected[bestIndex]);
      unselected.splice(bestIndex, 1);
    } else {
      break;
    }
  }

  return selected;
};

// ===========================================================================
// CORE UTILITIES WITH TIME-DECAY & COLD-START SUPPORT
// ===========================================================================

export const buildInteractionProfile = ({
  registeredEvents = [],
  bookmarkedEvents = [],
  viewedEvents = [],
  location = "",
} = {}) => {
  const weightedEvents = [
    ...registeredEvents.map((entry) => ({ entry, baseWeight: 4 })),
    ...bookmarkedEvents.map((entry) => ({ entry, baseWeight: 3 })),
    ...viewedEvents.map((entry) => ({ entry, baseWeight: 1 })),
  ];

  const categoryWeights = {};
  const typeWeights = {};
  const tagWeights = {};
  const locationCounts = {};
  const interactedIds = new Set();
  const registeredIds = new Set();

  weightedEvents.forEach(({ entry, baseWeight }) => {
    const event = unwrapEvent(entry);
    const id = getEventId(event);
    const category = getEventCategory(event);
    const type = getEventType(event);
    const eventLocation = normalizeText(event.location);

    // Apply time-decay multiplier based on interaction timestamp
    // (never fall back to the event date, which is not a recency signal)
    const interactionTime = entry?.createdAt || entry?.timestamp;
    const decayFactor = interactionTime ? applyTimeDecay(interactionTime) : 1.0;
    const weight = baseWeight * decayFactor;

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
    hasInteractions: weightedEvents.length > 0,
  };
};

export const calculateRecommendationScore = (
  event,
  userProfile = {},
  interactions = {},
) => {
  if (!event || typeof event !== "object") {
    return { score: 0, reasons: [], breakdown: [], isExpired: false };
  }

  // 1. Check Temporal Urgency & Expiration
  const temporal = calculateTemporalUrgencyScore(event.date || event.startDate);
  if (temporal.isExpired) {
    return { score: 0, reasons: ["Event has already passed"], breakdown: [], isExpired: true };
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

  // Add Temporal Proximity Boost
  if (temporal.score > 0) {
    addScore("Upcoming proximity boost", temporal.score, temporal.reason);
  }

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
    isExpired: false,
  };
};

export const getTrendingEventsForArea = (events = [], location = "", limit = 4) => {
  const matchesArea = createLocationMatcher(location);
  return [...events]
    .filter((event) => !calculateTemporalUrgencyScore(event.date || event.startDate).isExpired)
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
  diversityLambda = 0.75,
  limit = 8,
} = {}) => {
  const interactionProfile = buildInteractionProfile({
    registeredEvents,
    bookmarkedEvents,
    viewedEvents,
    location,
  });

  const scoredCandidates = events
    .filter((event) => includeInteracted || !interactionProfile.registeredIds.has(getEventId(event)))
    .map((event) => {
      const result = calculateRecommendationScore(event, userProfile, interactionProfile);
      return {
        ...event,
        calculatedMatch: result.score,
        recommendationScore: result.score,
        recommendationReasons: result.reasons,
        breakdown: result.breakdown,
        isExpired: result.isExpired,
      };
    })
    .filter((event) => !event.isExpired && event.recommendationScore > 0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  // Apply MMR diversity re-ranking to candidate pool
  return applyMaximalMarginalRelevance(scoredCandidates, diversityLambda, limit);
};
