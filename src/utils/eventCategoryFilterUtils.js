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

  // Return the first category from categories array if available
  if (event.categories && Array.isArray(event.categories) && event.categories.length > 0) {
    return event.categories[0];
  }

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

    // Also check if the event has the category in its categories array
    const hasCategoryInArray = event.categories && 
      Array.isArray(event.categories) && 
      event.categories.some(cat => cat.trim().toLowerCase() === selectedCategory);

    return eventCategory === selectedCategory || hasCategoryInArray;
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

  const normalizedCategory = category.trim().toLowerCase();
  const eventCategory = getEventCategory(event)
    .trim()
    .toLowerCase();

  // Also check if the event has the category in its categories array
  const hasCategoryInArray = event.categories && 
    Array.isArray(event.categories) && 
    event.categories.some(cat => cat.trim().toLowerCase() === normalizedCategory);

  return eventCategory === normalizedCategory || hasCategoryInArray;
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

  // Also add categories from the categories array
  events.forEach(event => {
    if (event.categories && Array.isArray(event.categories)) {
      event.categories.forEach(cat => {
        if (cat) categories.push(cat);
      });
    }
  });

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