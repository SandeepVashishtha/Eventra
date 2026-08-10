export const EVENT_CATEGORIES = [
  "All",
  "Hackathon",
  "Workshop",
  "Conference",
  "Webinar",
  "Competition",
  "Seminar",
  "Meetup",
];

/**
 * Get an event's category.
 */
export const getEventCategory = (event) => {
  if (!event) return "";

  return (
    event.category ||
    event.eventCategory ||
    event.type ||
    ""
  );
};

/**
 * Filter events by category.
 *
 * "All" returns every event.
 */
export const filterEventsByCategory = (
  events = [],
  category = "All"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (!category || category === "All") {
    return events;
  }

  const selectedCategory = category
    .trim()
    .toLowerCase();

  return events.filter((event) => {
    const eventCategory = getEventCategory(event)
      .trim()
      .toLowerCase();

    return eventCategory === selectedCategory;
  });
};

/**
 * Check whether an event belongs to a category.
 */
export const isEventInCategory = (
  event,
  category
) => {
  if (!event || !category) {
    return false;
  }

  if (category === "All") {
    return true;
  }

  return (
    getEventCategory(event)
      .trim()
      .toLowerCase() ===
    category.trim().toLowerCase()
  );
};

/**
 * Get the number of events in a category.
 */
export const getCategoryEventCount = (
  events = [],
  category = "All"
) => {
  return filterEventsByCategory(
    events,
    category
  ).length;
};

/**
 * Get available categories from the current events.
 */
export const getAvailableCategories = (
  events = []
) => {
  const categories = events
    .map(getEventCategory)
    .filter(Boolean);

  const normalizedCategories = new Map();

  categories.forEach((category) => {
    const normalized = category
      .trim()
      .toLowerCase();

    if (!normalizedCategories.has(normalized)) {
      normalizedCategories.set(
        normalized,
        category.trim()
      );
    }
  });

  return [
    "All",
    ...Array.from(
      normalizedCategories.values()
    ),
  ];
};