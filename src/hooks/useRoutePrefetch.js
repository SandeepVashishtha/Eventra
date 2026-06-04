import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { prefetchRoute } from "../utils/prefetchUtils";

/**
 * useRoutePrefetch Hook
 *
 * Automatically pre-fetches high-priority routes based on the current location.
 * Also returns a `prefetchRoute` function for imperative use (e.g. on hover/focus
 * of navigation links or event cards) so the chunk is already cached before the
 * user clicks, reducing the Suspense fallback window during transitions.
 *
 * FIX 3: Expose `prefetchRoute` imperatively so event-card click handlers can
 * call it on hover/pointerenter to warm the chunk before navigation fires.
 * Example usage in an event card:
 *
 *   const { prefetchRoute } = useRoutePrefetch();
 *   <div onPointerEnter={() => prefetchRoute(
 *     () => import('../Pages/Events/EventDetails'), 'details'
 *   )}>
 */
export const useRoutePrefetch = (config = {}) => {
  const location = useLocation();

  const prefetch = useCallback((importFn, key) => {
    // Wrap in requestIdleCallback to not block the main thread
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => prefetchRoute(importFn, key));
    } else {
      setTimeout(() => prefetchRoute(importFn, key), 2000);
    }
  }, []);

  // Immediate (non-idle) prefetch for imperative use on hover/focus.
  // Call this when the user signals intent (hover, focus, long-press) so
  // the chunk is already resolved by the time they click and navigate.
  const prefetchImmediate = useCallback((importFn, key) => {
    prefetchRoute(importFn, key);
  }, []);

  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      prefetch(() => import("../Pages/Events/EventsPage"), "explore");
      prefetch(() => import("../components/auth/Login"), "login");
    } else if (path === "/explore" || path === "/events") {
      prefetch(() => import("../Pages/Events/EventDetails"), "details");
      prefetch(
        () => import("../Pages/Events/EventRegistration"),
        "registration"
      );
    }
  }, [location.pathname, prefetch]);

  return {
    prefetchManual: prefetch,
    prefetchRoute: prefetchImmediate, // expose for hover-intent prefetch
  };
};