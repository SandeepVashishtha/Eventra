/**
 * Event search endpoint with mandatory pagination.
 *
 * Previously this endpoint returned every matching event in one response, so a
 * broad query such as "concert" could return thousands of records, freezing the
 * client and consuming large amounts of memory. This handler always paginates,
 * with a default page size of 20 and a hard maximum of 100, and returns a
 * standard pagination envelope so clients can page through results.
 *
 * When the data source supports native paginated queries (preferred), the
 * injected `searchEvents` performs LIMIT/OFFSET at the database level so the
 * server never materialises the full result set. A `countEvents` function
 * supplies the total for pagination metadata.
 */

import {
  normalizePagination,
  buildPageResponse,
  paginateArray,
} from "../lib/pagination.js";

/**
 * Search handler.
 *
 * @param {Object} req - Request with method and query
 * @param {Object} res - Response exposing status()/json()
 * @param {Object} [deps] - Injected dependencies for testability
 * @param {Function} [deps.searchEvents] - async ({ query, offset, pageSize }) => events[]
 *   Should apply LIMIT/OFFSET natively. If it returns the full set, the handler
 *   slices defensively so the response is paginated either way.
 * @param {Function} [deps.countEvents] - async ({ query }) => number
 */
export default async function searchEventsHandler(req, res, deps = {}) {
  if (req.method && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { searchEvents, countEvents } = deps;

  if (typeof searchEvents !== "function") {
    res.status(503).json({ error: "Search service unavailable" });
    return;
  }

  const query = (req.query?.q ?? req.query?.query ?? "").toString().trim();
  const { page, pageSize, offset } = normalizePagination(req.query || {});

  try {
    const rows = await searchEvents({ query, offset, pageSize });
    const safeRows = Array.isArray(rows) ? rows : [];

    // Defensive slice: if the data source ignored offset/pageSize and returned
    // everything, we still emit at most pageSize items.
    const items =
      safeRows.length > pageSize
        ? paginateArray(safeRows, offset, pageSize)
        : safeRows;

    const total =
      typeof countEvents === "function"
        ? await countEvents({ query })
        : // Best-effort fallback when no count function is provided.
          offset + items.length + (items.length === pageSize ? 1 : 0);

    res.status(200).json(
      buildPageResponse({ items, total, page, pageSize })
    );
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
