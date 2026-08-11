/**
 * Remove events already registered by the user
 */
export const removeRegisteredEvents = (
  events = [],
  registeredEvents = []
) => {
  const registeredIds = new Set(
    registeredEvents.map((event) => event.id)
  );

  return events.filter(
    (event) => !registeredIds.has(event.id)
  );
};

/**
 * Recommend events based on preferred categories
 */
export const recommendByCategory = (
  events = [],
  preferredCategories = []
) => {
  if (!preferredCategories.length) return [];

  return events
    .filter((event) =>
      preferredCategories.includes(event.category)
    )
    .map((event) => ({
      ...event,
      reason: "Based on your preferred category",
    }));
};

/**
 * Recommend events based on user skills
 */
export const recommendBySkills = (
  events = [],
  skills = []
) => {
  if (!skills.length) return [];

  return events
    .filter((event) =>
      skills.some((skill) =>
        event.title?.toLowerCase().includes(skill.toLowerCase()) ||
        event.description
          ?.toLowerCase()
          .includes(skill.toLowerCase())
      )
    )
    .map((event) => ({
      ...event,
      reason: "Matches your skills",
    }));
};

/**
 * Recommend trending events
 */
export const recommendTrendingEvents = (
  events = []
) => {
  return events
    .filter((event) => event.trending || event.popular)
    .map((event) => ({
      ...event,
      reason: "Trending event",
    }));
};

/**
 * Sort recommendations
 */
export const sortRecommendations = (
  recommendations = []
) => {
  return [...recommendations].sort((a, b) => {
    const scoreA =
      (a.trending ? 3 : 0) +
      (a.popular ? 2 : 0);

    const scoreB =
      (b.trending ? 3 : 0) +
      (b.popular ? 2 : 0);

    return scoreB - scoreA;
  });
};

/**
 * Remove duplicate events
 */
export const uniqueRecommendations = (
  recommendations = []
) => {
  const seen = new Set();

  return recommendations.filter((event) => {
    if (seen.has(event.id)) return false;

    seen.add(event.id);
    return true;
  });
};

/**
 * Main recommendation function
 */
export const getRecommendedEvents = (
  events = [],
  user = {},
  registeredEvents = []
) => {
  const availableEvents = removeRegisteredEvents(
    events,
    registeredEvents
  );

  const categoryRecommendations =
    recommendByCategory(
      availableEvents,
      user.preferredCategories || []
    );

  const skillRecommendations =
    recommendBySkills(
      availableEvents,
      user.skills || []
    );

  const trendingRecommendations =
    recommendTrendingEvents(
      availableEvents
    );

  const merged = [
    ...categoryRecommendations,
    ...skillRecommendations,
    ...trendingRecommendations,
  ];

  return sortRecommendations(
    uniqueRecommendations(merged)
  );
};