const STORAGE_KEY = "eventra_recently_viewed_events";
const MAX_RECENT_EVENTS = 10;

/**
 * Get recently viewed events from localStorage.
 */
export const getRecentlyViewedEvents = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const events = JSON.parse(stored);

    return Array.isArray(events) ? events : [];
  } catch (error) {
    console.error(
      "Failed to load recently viewed events:",
      error
    );

    return [];
  }
};

/**
 * Save recently viewed events.
 */
const saveRecentlyViewedEvents = (events) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events)
    );

    return events;
  } catch (error) {
    console.error(
      "Failed to save recently viewed events:",
      error
    );

    return events;
  }
};

/**
 * Add an event to recently viewed history.
 *
 * The newest event is placed first.
 * Duplicate events are removed.
 */
export const addRecentlyViewedEvent = (
  event
) => {
  if (!event || event.id === undefined) {
    return getRecentlyViewedEvents();
  }

  const existingEvents =
    getRecentlyViewedEvents();

  const filteredEvents = existingEvents.filter(
    (item) => item.id !== event.id
  );

  const updatedEvents = [
    {
      ...event,
      viewedAt: new Date().toISOString(),
    },
    ...filteredEvents,
  ].slice(0, MAX_RECENT_EVENTS);

  return saveRecentlyViewedEvents(
    updatedEvents
  );
};

/**
 * Remove one event from recently viewed history.
 */
export const removeRecentlyViewedEvent = (
  eventId
) => {
  const events = getRecentlyViewedEvents();

  const updatedEvents = events.filter(
    (event) => event.id !== eventId
  );

  return saveRecentlyViewedEvents(
    updatedEvents
  );
};

/**
 * Clear all recently viewed events.
 */
export const clearRecentlyViewedEvents = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      "Failed to clear recently viewed events:",
      error
    );
  }

  return [];
};

/**
 * Check whether an event exists in recently viewed history.
 */
export const isEventRecentlyViewed = (
  eventId
) => {
  return getRecentlyViewedEvents().some(
    (event) => event.id === eventId
  );
};

/**
 * Get the maximum number of stored events.
 */
export const getRecentlyViewedLimit = () => {
  return MAX_RECENT_EVENTS;
};