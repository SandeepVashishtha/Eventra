import { safeJsonParse } from "./safeJsonParse";

const EVENTS_CACHE_KEY = "eventra_cached_events";
const EVENT_DETAILS_CACHE_KEY = "eventra_cached_event_details";

const readJson = (key, fallback) => {
  try {
    return safeJsonParse(localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const saveCachedEvents = (events = []) => {
  if (!Array.isArray(events) || events.length === 0) {
    return false;
  }

  return writeJson(EVENTS_CACHE_KEY, {
    cachedAt: new Date().toISOString(),
    events,
  });
};

export const getCachedEvents = () => {
  const cached = readJson(EVENTS_CACHE_KEY, null);
  if (!cached || !Array.isArray(cached.events)) {
    return null;
  }
  return cached;
};

/**
 * Write a single event detail entry to the cache.
 * Reads the existing cache object, adds the entry, and writes back.
 * Use saveAllCachedEventDetails() when persisting many events at once
 * to avoid O(n) read+write cycles.
 */
export const saveCachedEventDetail = (event) => {
  if (!event?.id) {
    return false;
  }

  const cached = readJson(EVENT_DETAILS_CACHE_KEY, {});
  cached[event.id] = {
    cachedAt: new Date().toISOString(),
    event,
  };

  return writeJson(EVENT_DETAILS_CACHE_KEY, cached);
};

/**
 * Batch-write multiple event detail entries to the cache in a single
 * localStorage read+write cycle.
 *
 * Use this instead of nextEvents.forEach(saveCachedEventDetail) — the
 * forEach pattern triggers N independent read+write pairs, each one
 * loading and saving the entire cache object. For 50+ events this is
 * 100+ synchronous localStorage operations on the main thread.
 *
 * This function reads once, applies all entries, and writes once
 * regardless of N.
 *
 * @param {Array} events - Array of event objects to cache.
 * @returns {boolean} True if the write succeeded.
 */
export const saveAllCachedEventDetails = (events = []) => {
  if (!Array.isArray(events) || events.length === 0) {
    return false;
  }

  const cached = readJson(EVENT_DETAILS_CACHE_KEY, {});
  const now = new Date().toISOString();

  events.forEach((event) => {
    if (event?.id) {
      cached[event.id] = { cachedAt: now, event };
    }
  });

  return writeJson(EVENT_DETAILS_CACHE_KEY, cached);
};

export const getCachedEventDetail = (eventId) => {
  const cached = readJson(EVENT_DETAILS_CACHE_KEY, {});
  return cached?.[eventId] || null;
};

export const getCacheAgeLabel = (cachedAt) => {
  if (!cachedAt) {
    return "cached earlier";
  }

  const ageMs = Date.now() - new Date(cachedAt).getTime();
  if (!Number.isFinite(ageMs) || ageMs < 0) {
    return "cached recently";
  }

  const minutes = Math.max(1, Math.round(ageMs / 60000));
  if (minutes < 60) {
    return `cached ${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `cached ${hours} hr ago`;
  }

  const days = Math.round(hours / 24);
  return `cached ${days} day${days === 1 ? "" : "s"} ago`;
};
