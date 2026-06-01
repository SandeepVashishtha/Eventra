import { safeJsonParse } from "./safeJsonParse";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./safeStorage.js";


const EVENTS_CACHE_KEY = "eventra_cached_events";
const EVENT_DETAILS_CACHE_KEY = "eventra_cached_event_details";

// ---------------------------------------------------------------------------
// Cache TTL configuration
//
// Without TTL enforcement stale event data could be served indefinitely.
// A user offline for several days would see cancelled or rescheduled events
// as originally cached, and registration status could be incorrect.
//
// Event list: 24 hours — lists change slowly; daily freshness is sufficient.
// Event detail: 6 hours  — individual events can be edited or cancelled
//               more frequently (capacity, schedule changes).
// ---------------------------------------------------------------------------
export const EVENTS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;  // 24 hours
export const DETAIL_CACHE_TTL_MS =  6 * 60 * 60 * 1000;  //  6 hours

const readJson = (key, fallback) => {
  try {
    return safeJsonParse(safeGetItem(key), fallback);
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    safeSetItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/** Returns the age of a `cachedAt` ISO timestamp in milliseconds. */
const cacheAgeMs = (cachedAt) => {
  if (!cachedAt) return Infinity;
  const age = Date.now() - new Date(cachedAt).getTime();
  return Number.isFinite(age) && age >= 0 ? age : Infinity;
};

// ---------------------------------------------------------------------------
// Event list cache
// ---------------------------------------------------------------------------

export const saveCachedEvents = (events = []) => {
  if (!Array.isArray(events) || events.length === 0) {
    return false;
  }
  return writeJson(EVENTS_CACHE_KEY, {
    cachedAt: new Date().toISOString(),
    events,
  });
};

/**
 * Returns the cached events list, or null if absent or older than
 * EVENTS_CACHE_TTL_MS. Evicts the stale entry from localStorage on expiry
 * so it does not accumulate indefinitely.
 */
export const getCachedEvents = () => {
  const cached = readJson(EVENTS_CACHE_KEY, null);
  if (!cached || !Array.isArray(cached.events)) {
    return null;
  }
  if (cacheAgeMs(cached.cachedAt) > EVENTS_CACHE_TTL_MS) {
    try { safeRemoveItem(EVENTS_CACHE_KEY); } catch { /* non-fatal */ }
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
// ---------------------------------------------------------------------------
// Event detail cache
// ---------------------------------------------------------------------------

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

/**
 * Returns the cached detail for a single event, or null if absent or older
 * than DETAIL_CACHE_TTL_MS. Prunes the expired entry and any other stale
 * sibling entries from the detail cache on access.
 */
export const getCachedEventDetail = (eventId) => {
  const cached = readJson(EVENT_DETAILS_CACHE_KEY, {});
  let dirty = false;

  // Prune all stale detail entries in a single pass while we have the object.
  for (const id of Object.keys(cached)) {
    if (cacheAgeMs(cached[id]?.cachedAt) > DETAIL_CACHE_TTL_MS) {
      delete cached[id];
      dirty = true;
    }
  }

  if (dirty) {
    writeJson(EVENT_DETAILS_CACHE_KEY, cached);
  }

  return cached[eventId] ?? null;
};

// ---------------------------------------------------------------------------
// Shared display helper
// ---------------------------------------------------------------------------

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
