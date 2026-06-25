const DEFAULT_RECOMMENDATION_LIMIT = 6;

const normalizeText = (value = "") => String(value).trim().toLowerCase();

const getTokenSet = (value) =>
  new Set(
    normalizeText(value)
      .split(/[^a-z0-9]+/i)
      .filter(Boolean)
  );

const getInterestTokens = (interests = []) =>
  new Set(interests.flatMap((interest) => Array.from(getTokenSet(interest))).filter(Boolean));

const getEventTokens = (event) =>
  new Set([
    ...getTokenSet(event.title),
    ...getTokenSet(event.description),
    ...getTokenSet(event.location),
    ...getTokenSet(event.category),
    ...getTokenSet(event.type),
    ...(event.tags || []).flatMap((tag) => Array.from(getTokenSet(tag))),
  ]);

const getDateScore = (event, referenceDate) => {
  const eventDate = new Date(event.date);

  if (Number.isNaN(eventDate.getTime())) {
    return 0;
  }

  const daysUntilEvent = Math.round(
    (eventDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEvent < 0) return -8;
  if (daysUntilEvent <= 7) return 12;
  if (daysUntilEvent <= 30) return 8;
  if (daysUntilEvent <= 90) return 4;
  return 1;
};

const getCapacityScore = (event) => {
  if (!event.maxAttendees || event.maxAttendees <= 0) return 0;

  const fillRatio = (event.attendees || 0) / event.maxAttendees;

  if (fillRatio >= 1) return -6;
  if (fillRatio >= 0.8) return 6;
  if (fillRatio >= 0.4) return 4;
  return 2;
};

export const scoreRecommendedEvent = ({
  event,
  currentEvent,
  userInterests = [],
  referenceDate = new Date(),
}) => {
  let score = 0;
  const eventCategory = normalizeText(event.category || event.type);
  const currentCategory = normalizeText(currentEvent?.category || currentEvent?.type);

  if (currentCategory && eventCategory === currentCategory) {
    score += 32;
  }

  if (currentEvent?.type && normalizeText(event.type) === normalizeText(currentEvent.type)) {
    score += 16;
  }

  const interestTokens = getInterestTokens(userInterests);
  const eventTokens = getEventTokens(event);

  interestTokens.forEach((token) => {
    if (eventTokens.has(token)) {
      score += 10;
    }
  });

  const currentTags = new Set(
    (currentEvent?.tags || []).flatMap((tag) => Array.from(getTokenSet(tag)))
  );

  currentTags.forEach((tag) => {
    if (eventTokens.has(tag)) {
      score += 8;
    }
  });

  score += getDateScore(event, referenceDate);
  score += getCapacityScore(event);

  return score;
};

export const getRecommendedEvents = ({
  events,
  currentEventId,
  currentCategory,
  userInterests = [],
  limit = DEFAULT_RECOMMENDATION_LIMIT,
  referenceDate = new Date(),
}) => {
  const currentEvent =
    events.find((event) => event.id === currentEventId) ||
    (currentCategory ? { category: currentCategory, type: currentCategory, tags: [] } : null);

  return events
    .filter((event) => event.id !== currentEventId)
    .map((event) => ({
      ...event,
      recommendationScore: scoreRecommendedEvent({
        event,
        currentEvent,
        userInterests,
        referenceDate,
      }),
    }))
    .sort((a, b) => {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }

      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();

      if (!Number.isNaN(aDate) && !Number.isNaN(bDate) && aDate !== bDate) {
        return aDate - bDate;
      }

      return String(a.title).localeCompare(String(b.title));
    })
    .slice(0, limit);
};
