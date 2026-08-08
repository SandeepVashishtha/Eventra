/**
 * Route-Based Component Prefetching Utility
 * 
 * Caches and schedules dynamic imports for key lazy-loaded pages.
 */

const prefetchCache = new Map();

const createPrefetchPlaceholder = () => ({
  default: function PrefetchPlaceholder() {
    return null;
  },
});

const loadRouteModule = (importFn) => {
  if (typeof window === "undefined" || typeof window.document === "undefined") {
    return Promise.resolve(createPrefetchPlaceholder());
  }

  return importFn();
};

const ROUTE_REGISTRY = {
  home: () => import("../Pages/Home/HomePage.js"),
  events: () => import("../Pages/Events/EventsPage.js"),
  dashboard: () => import("../components/Dashboard.js"),
  hackathons: () => import("../Pages/Hackathons/HackathonPage.js"),
  profile: () => import("../components/user/UserProfile.js"),
  projects: () => import("../Pages/Projects/ProjectsPage.js"),
};

/**
 * Prefetches a route component dynamic import.
 * @param {string} routeName - Name of the registered route keyword
 * @returns {Promise|undefined} The dynamic import promise
 */
export const prefetchRoute = (routeName) => {
  const importFn = ROUTE_REGISTRY[routeName];
  if (!importFn) return;

  if (prefetchCache.has(routeName)) {
    return prefetchCache.get(routeName);
  }

  const promise = loadRouteModule(importFn)
    .then((module) => {
      return module;
    })
    .catch((error) => {
      console.warn(`[Prefetch] Failed to prefetch route "${routeName}":`, error);
      prefetchCache.delete(routeName);
    });

  prefetchCache.set(routeName, promise);
  return promise;
};

/**
 * Prefetches multiple route components when the browser is idle.
 * @param {string[]} routeNames - Array of route keywords to load
 */
export const prefetchRoutesIdle = (routeNames) => {
  const triggerPrefetches = () => {
    routeNames.forEach((name) => {
      prefetchRoute(name);
    });
  };

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(triggerPrefetches);
  } else {
    setTimeout(triggerPrefetches, 2000);
  }
};

/**
 * Returns the current prefetch cache size (useful for unit testing).
 * @returns {number}
 */
export const getPrefetchCacheSize = () => {
  return prefetchCache.size;
};

/**
 * Clears the prefetch cache (useful for unit testing).
 */
export const clearPrefetchCache = () => {
  prefetchCache.clear();
};
