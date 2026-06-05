import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { prefetchRoute } from "../utils/prefetchUtils";

/**
 * useRoutePrefetch Hook
 * 
 * Automatically pre-fetches high-priority routes based on the current location.
 * For example, if the user is on the Home page, we might pre-fetch the Explore page.
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

  useEffect(() => {
    const path = location.pathname;

    // Define prefetch strategies based on current path
    if (path === "/") {
      // On home, prefetch major entry points
      prefetch(() => import("../Pages/Events/ExploreEvents"), "explore");
      prefetch(() => import("../components/auth/Login"), "login");
    } else if (path === "/explore" || path === "/events") {
      // On explore, prefetch event details and registration
      prefetch(() => import("../Pages/Events/EventDetails"), "details");
      prefetch(() => import("../Pages/Events/EventRegistration"), "registration");
    }
  }, [location.pathname, prefetch]);

  return { prefetchManual: prefetch };
};
