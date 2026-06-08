/**
 * In-memory cache for GitHub user profile data fetched by ContributorsCarousel.
 *
 * WHY THIS EXISTS
 * ───────────────
 * ContributorsCarousel fires one GET request per contributor to enrich the
 * contributor list with follower counts, bios, and locations. Without a cache,
 * every mount (React StrictMode double-invoke, tab refocus, route navigation)
 * re-issues the full fan-out of N profile requests. For a project with 50+
 * contributors this generates 50+ near-simultaneous proxy hits and quickly
 * exhausts the unauthenticated GitHub API rate limit (60 req/hr per IP).
 *
 * This module provides:
 *   - A module-level Map that survives re-renders and re-mounts within the
 *     same page session (unlike localStorage which requires JSON parse/stringify
 *     on every access)
 *   - In-flight deduplication: a second caller asking for the same username
 *     before the first request settles receives the same Promise, not a new
 *     network request
 *   - A configurable TTL so stale entries are evicted on the next access
 *   - A `fetchWithConcurrencyLimit` helper that processes the full contributor
 *     list in small parallel batches, preventing a burst of simultaneous
 *     requests that would overwhelm the proxy or trigger rate limiting
 */

const PROFILE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const FETCH_TIMEOUT_MS = 10000; // 🔥 10 seconds timeout limit

/** @type {Map<string, { data: object, fetchedAt: number }>} */
const profileCache = new Map();

/** @type {Map<string, Promise<object>>} */
const inFlightRequests = new Map();

/**
 * Returns the cached profile for `username` if it exists and has not expired.
 *
 * @param {string} username
 * @returns {object|null}
 */
export function getCachedProfile(username) {
  const entry = profileCache.get(username);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > PROFILE_CACHE_TTL_MS) {
    profileCache.delete(username);
    return null;
  }
  return entry.data;
}

/**
 * Stores a resolved profile in the in-memory cache.
 *
 * @param {string} username
 * @param {object} data
 */
export function setCachedProfile(username, data) {
  profileCache.set(username, { data, fetchedAt: Date.now() });
}

/**
 * Wraps a profile-fetch function with in-flight deduplication and caching.
 *
 * If a request for `username` is already in-flight, the existing Promise is
 * returned — no second network request is made. Once the request settles the
 * result is cached and the in-flight entry is removed.
 *
 * @param {string}   username
 * @param {function} fetcher  - `(username: string) => Promise<object>`
 * @returns {Promise<object>}
 */
export function fetchProfileWithCache(username, fetcher) {
  const cached = getCachedProfile(username);
  if (cached) return Promise.resolve(cached);

  const existing = inFlightRequests.get(username);
  if (existing) return existing;

  // Race the fetcher against the timeout and always clear the timer when settled
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Fetch timeout for profile: ${username}`)),
      FETCH_TIMEOUT_MS
    );
  });

  const request = Promise.race([fetcher(username), timeoutPromise]).then(
    (data) => {
      setCachedProfile(username, data);
      inFlightRequests.delete(username);
      return data;
    },
    (err) => {
      inFlightRequests.delete(username);
      throw err;
    }
  ).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  inFlightRequests.set(username, request);
  return request;
}

/**
 * Processes an array of items in parallel batches of `concurrency`, calling
 * `taskFn` for each item. Uses `Promise.allSettled` so that a single failing
 * request does not abort the rest of the batch.
 *
 * Returns an array of settled results in the same order as `items`. Rejected
 * items carry `{ status: 'rejected', reason }` and must be handled by the
 * caller.
 *
 * @template T, R
 * @param {T[]}            items        - Items to process
 * @param {function(T): Promise<R>} taskFn - Async function to call per item
 * @param {number}          [concurrency=5]
 * @returns {Promise<PromiseSettledResult<R>[]>}
 */
export async function fetchWithConcurrencyLimit(items, taskFn, concurrency = 5) {
  const results = new Array(items.length);

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(taskFn));

    batchResults.forEach((result, batchIndex) => {
      results[i + batchIndex] = result;
    });
  }

  return results;
}

/**
 * Clears the in-memory profile cache.
 * Intended for use in tests only — not needed in production code.
 */
export function clearProfileCache() {
  profileCache.clear();
  inFlightRequests.clear();
}

/**
 * Returns the number of entries currently in the profile cache.
 * Useful for debugging and testing.
 *
 * @returns {number}
 */
export function profileCacheSize() {
  return profileCache.size;
}
export const getEvictionThreshold = () => {
  return PROFILE_CACHE_TTL_MS;
};
