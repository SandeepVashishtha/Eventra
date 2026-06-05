/**
 * Server-side pagination helpers for list/search endpoints.
 *
 * The event search endpoint previously returned every matching row in a single
 * response. For popular queries this meant thousands of records in one payload,
 * freezing the browser and consuming large amounts of memory and bandwidth.
 * These helpers normalise pagination parameters with hard upper bounds so a
 * single request can never return an unbounded result set.
 */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Normalises raw page/pageSize query values into safe integers.
 *
 * - page is clamped to >= 1
 * - pageSize is clamped to [1, MAX_PAGE_SIZE] and defaults to DEFAULT_PAGE_SIZE
 * - non-numeric input falls back to defaults instead of throwing
 *
 * @param {Object} query
 * @param {string|number} [query.page]
 * @param {string|number} [query.pageSize]
 * @returns {{ page: number, pageSize: number, offset: number }}
 */
export function normalizePagination(query = {}) {
  const rawPage = Number.parseInt(query.page, 10);
  const rawSize = Number.parseInt(query.pageSize, 10);

  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  let pageSize = Number.isFinite(rawSize) && rawSize >= 1 ? rawSize : DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) {
    pageSize = MAX_PAGE_SIZE;
  }

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

/**
 * Builds a standard paginated response envelope.
 *
 * @param {Object} params
 * @param {Array} params.items - The page of items
 * @param {number} params.total - Total matching items across all pages
 * @param {number} params.page - Current page (1-based)
 * @param {number} params.pageSize - Items per page
 * @returns {{ data: Array, pagination: Object }}
 */
export function buildPageResponse({ items, total, page, pageSize }) {
  const totalPages = total <= 0 ? 0 : Math.ceil(total / pageSize);

  return {
    data: items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    },
  };
}

/**
 * Applies offset pagination to an in-memory array.
 * Used when the data source cannot paginate natively.
 *
 * @param {Array} items
 * @param {number} offset
 * @param {number} pageSize
 * @returns {Array}
 */
export function paginateArray(items, offset, pageSize) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.slice(offset, offset + pageSize);
}
