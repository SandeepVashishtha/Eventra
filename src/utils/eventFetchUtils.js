/**
 * Utilities for fetching events with server-side pagination support.
 *
 * The backend accepts optional `page` (0-indexed) and `size` query params.
 * When the backend returns a Spring-style Page envelope the response looks like:
 *
 * { content: [...], totalElements: N, totalPages: P, number: 0, size: 20 }
 *
 * When it returns a plain array (no pagination metadata), all results arrived
 * in one shot — totalElements is inferred from the array length and only one
 * page exists server-side.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Previously `fetchEvents` called GET /api/events with no query parameters,
 * forcing the backend to return every event in a single response. On large
 * deployments this causes unnecessary memory pressure (serialising thousands
 * of event objects), inflates Time-to-First-Byte, and saturates the user's
 * connection for data that will never be rendered (because client-side
 * pagination already limits what's shown). Passing `page` and `size` lets the
 * backend apply a LIMIT/OFFSET at the database layer and return only the
 * records that are actually needed for the current view.
 */

import { getEventStatus } from "./eventUtils";

/**
 * Shape returned from the backend when the endpoint is pagination-aware.
 *
 * @typedef {Object} PageEnvelope
 * @property {Array}  content       - Events on the current page
 * @property {number} totalElements - Total record count across all pages
 * @property {number} totalPages    - Total number of pages
 * @property {number} number        - Current page index (0-based)
 * @property {number} size          - Requested page size
 */

/**
 * Default page size used when no explicit size is passed.
 * Matches DEFAULT_EVENTS_PER_PAGE in eventPaginationUtils so the first load
 * brings exactly the right number of events without an immediate second fetch.
 */
export const SERVER_PAGE_SIZE = 20;

/**
 * Appends `page` and `size` query parameters to a URL string.
 * Preserves any query parameters already present on the URL.
 *
 * @param {string} baseUrl  - The endpoint URL (may already contain a query string)
 * @param {number} page     - 0-based page index
 * @param {number} size     - Number of records per page
 * @returns {string}
 */
export function buildPaginatedUrl(baseUrl, page, size) {
  if (!baseUrl) return baseUrl;

  // 🔥 FIX: Prevent URL Parameter Pollution and Pagination Freezing.
  // The old logic used string concatenation which blindly appended duplicate 'page' parameters
  // (e.g., ?category=tech&page=0&page=1). Backend frameworks (like Spring) often extract the
  // *first* instance of a parameter, permanently freezing the UI on page 0.
  const [urlWithoutHash, hash] = baseUrl.split("#");
  const [path, queryString] = urlWithoutHash.split("?");

  const params = new URLSearchParams(queryString || "");
  
  // .set() explicitly overwrites existing keys, eliminating duplicate parameter pollution
  params.set("page", page);
  params.set("size", size);

  const newUrl = `${path}?${params.toString()}`;
  return hash ? `${newUrl}#${hash}` : newUrl;
}

/**
 * Normalises a raw event object from the API by computing its derived
 * `status` field so downstream consumers don't need to call getEventStatus.
 *
 * @param {object} rawEvent
 * @returns {object}
 */
export function normalizeEvent(rawEvent) {
  return {
    ...rawEvent,
    status: getEventStatus(rawEvent),
  };
}

/**
 * Normalises an array of raw events.
 *
 * @param {Array} rawEvents
 * @returns {Array}
 */
export function normalizeEvents(rawEvents) {
  if (!Array.isArray(rawEvents)) return [];
  return rawEvents.map(normalizeEvent);
}

/**
 * Determines whether an Axios response body is a Spring Page envelope or a
 * plain array. Returns a normalised result in either case.
 *
 * @param {*} responseData  - `response.data` from an Axios call
 * @returns {{ events: Array, totalElements: number, totalPages: number, isServerPaginated: boolean }}
 */
export function parseEventsResponse(responseData) {
  if (responseData && typeof responseData === "object" && !Array.isArray(responseData)) {
    const { content, totalElements, totalPages } = responseData;

    if (Array.isArray(content)) {
      return {
        events: normalizeEvents(content),
        totalElements: typeof totalElements === "number" ? totalElements : content.length,
        totalPages: typeof totalPages === "number" ? totalPages : 1,
        isServerPaginated: true,
      };
    }
  }

  const rawList = Array.isArray(responseData) ? responseData : [];
  return {
    events: normalizeEvents(rawList),
    totalElements: rawList.length,
    totalPages: 1,
    isServerPaginated: false,
  };
}

/**
 * Builds the fetch parameters for the events endpoint.
 * Translates the 1-based `currentPage` used in the UI to the 0-based index
 * expected by Spring Data's Pageable.
 *
 * @param {number} currentPage   - 1-based page number from the UI
 * @param {number} eventsPerPage - Number of events to display per page
 * @returns {{ page: number, size: number }}
 */
export function buildFetchParams(currentPage, eventsPerPage) {
  return {
    page: Math.max(0, currentPage - 1),
    size: eventsPerPage > 0 ? eventsPerPage : SERVER_PAGE_SIZE,
  };
}

/**
 * Returns true if the response indicates that the backend supports server-side
 * pagination (i.e. it returned a Page envelope rather than a flat array).
 *
 * Callers can use this to decide whether to re-fetch when the page changes, or
 * whether to keep the full dataset in memory and paginate client-side.
 *
 * @param {ReturnType<parseEventsResponse>} parsed
 * @returns {boolean}
 */
export function supportsServerPagination(parsed) {
  return parsed.isServerPaginated === true;
}

/**
 * Produces a human-readable description of the current page range for
 * accessibility labels and "Showing X–Y of Z events" UI text.
 *
 * @param {number} currentPage   - 1-based current page
 * @param {number} eventsPerPage - Events shown per page
 * @param {number} totalElements - Total event count across all pages
 * @returns {string}  e.g. "Showing 21–40 of 183 events"
 */
export function buildPageRangeLabel(currentPage, eventsPerPage, totalElements) {
  if (totalElements === 0) return "No events found";

  const start = (currentPage - 1) * eventsPerPage + 1;
  const end = Math.min(currentPage * eventsPerPage, totalElements);

  return `Showing ${start}–${end} of ${totalElements} events`;
}

/**
 * Determines whether a fetch is needed for a new page when the backend
 * supports server-side pagination.
 *
 * If the backend returned a plain array (all events in one go), we already
 * have all the data and should not re-fetch on page change — the existing
 * client-side slice handles it. If the backend returned a Page envelope, each
 * page change must trigger a new fetch.
 *
 * @param {boolean} isServerPaginated  - From parseEventsResponse
 * @param {number}  currentPage        - UI's current 1-based page
 * @param {number}  lastFetchedPage    - Page for which data is currently held
 * @returns {boolean}
 */
export function needsRefetch(isServerPaginated, currentPage, lastFetchedPage) {
  return isServerPaginated && currentPage !== lastFetchedPage;
}