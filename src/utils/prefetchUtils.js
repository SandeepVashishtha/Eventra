/**
 * Route Prefetching Utilities
 * 
 * Provides functions to pre-load lazy-loaded route components.
 */

const prefetchMap = new Map();
const MAX_CONCURRENT_PREFETCHES = 4;

async function asyncPool(iterable, iteratorFn, concurrency) {
  const items = Array.isArray(iterable) ? iterable : [...iterable];
  const results = [];
  const executing = new Set();

  for (const [index, item] of items.entries()) {
    const promise = Promise.resolve().then(() => iteratorFn(item, index));
    results.push(promise);
    executing.add(promise);

    const clean = () => executing.delete(promise);
    promise.then(clean, clean);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

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
 * Pre-fetches multiple routes with a concurrency limit.
 * @param {Array<Object>} routes - Array of { importFn, key } objects
 */
export const prefetchRoutes = (routes) => {
  return asyncPool(
    routes,
    ({ importFn, key }) => prefetchRoute(importFn, key),
    MAX_CONCURRENT_PREFETCHES
  );
};
