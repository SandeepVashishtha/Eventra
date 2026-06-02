/**
 * Route Prefetching Utilities
 * 
 * Provides functions to pre-load lazy-loaded route components.
 */

const prefetchMap = new Map();

/**
 * Pre-fetches a dynamic import and caches the result.
 * @param {Function} importFn - The dynamic import function, e.g., () => import('./Page')
 * @param {string} key - A unique key for the import
 */
export const prefetchRoute = async (importFn, key) => {
  if (prefetchMap.has(key)) return prefetchMap.get(key);

  try {
    const promise = importFn();
    prefetchMap.set(key, promise);
    await promise;
    return promise;
  } catch (error) {
    console.warn(`[Prefetch] Failed to prefetch route: ${key}`, error);
    prefetchMap.delete(key);
  }
};

/**
 * Pre-fetches multiple routes in parallel.
 * @param {Array<Object>} routes - Array of { importFn, key } objects
 */
export const prefetchRoutes = (routes) => {
  return Promise.all(routes.map(({ importFn, key }) => prefetchRoute(importFn, key)));
};
