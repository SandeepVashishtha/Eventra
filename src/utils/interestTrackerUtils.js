const STORAGE_KEY = "eventra-interested-events";

/**
 * Get all interested events
 */
export const getInterestedEvents = () => {
  try {
    const events = localStorage.getItem(STORAGE_KEY);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error("Failed to load interested events:", error);
    return [];
  }
};

/**
 * Save interested events
 */
export const saveInterestedEvents = (events) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events)
    );
  } catch (error) {
    console.error("Failed to save interested events:", error);
  }
};

/**
 * Add an event to interested list
 */
export const addInterestedEvent = (event) => {
  if (!event || typeof event !== "object" || !event.id) {
    return getInterestedEvents();
  }
  const events = getInterestedEvents();

  const exists = events.some(
    (item) => item.id === event.id
  );

  if (exists) return events;

  const updated = [
    {
      ...event,
      interestedAt: new Date().toISOString(),
    },
    ...events,
  ];

  saveInterestedEvents(updated);

  return updated;
};

/**
 * Remove an event
 */
export const removeInterestedEvent = (eventId) => {
  const updated = getInterestedEvents().filter(
    (event) => event.id !== eventId
  );

  saveInterestedEvents(updated);

  return updated;
};

/**
 * Check if an event is marked as interested
 */
export const isInterested = (eventId) => {
  return getInterestedEvents().some(
    (event) => event.id === eventId
  );
};

/**
 * Toggle interest status
 */
export const toggleInterestedEvent = (event) => {
  if (isInterested(event.id)) {
    return removeInterestedEvent(event.id);
  }

  return addInterestedEvent(event);
};

/**
 * Clear all interested events
 */
export const clearInterestedEvents = () => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Get interested event count
 */
export const getInterestedCount = () => {
  return getInterestedEvents().length;
};

/**
 * Search interested events
 */
export const searchInterestedEvents = (query = "") => {
  const events = getInterestedEvents();

  if (!query.trim()) return events;

  const keyword = query.toLowerCase();

  return events.filter(
    (event) =>
      event.title?.toLowerCase().includes(keyword) ||
      event.location?.toLowerCase().includes(keyword) ||
      event.category?.toLowerCase().includes(keyword)
  );
};

/**
 * Sort interested events
 */
export const sortInterestedEvents = (
  events,
  sortBy = "latest"
) => {
  const sorted = [...events];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => {
        const titleA = String(a?.title || "");
        const titleB = String(b?.title || "");
        return titleA.localeCompare(titleB);
      });

    case "date":
      return sorted.sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );

    case "latest":
    default:
      return sorted.sort(
        (a, b) =>
          new Date(b.interestedAt) -
          new Date(a.interestedAt)
      );
  }
};