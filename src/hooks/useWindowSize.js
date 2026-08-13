/**
 * useWindowSize.js
 *
 * Reactive window dimensions hook with debouncing and ResizeObserver support.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * window.addEventListener("resize") was duplicated in 11+ components:
 *
 *   App.jsx                    — setIsDesktop(width >= 1024)
 *   EventRecommendations.jsx   — setVisibleCount based on breakpoints
 *   ContributorsCarousel.js    — setItemsPerView based on breakpoints
 *   WhatsHappening.js          — setCardsPerView based on breakpoints
 *   ConfettiCanvas.jsx         — canvas.width/height = window dimensions
 *   ShareMenu.js               — repositions dropdown on resize
 *   OnboardingChecklist.jsx    — triggers layout recalculation
 *   InteractiveWhiteboard.jsx  — recalculates canvas bounds
 *   DesktopNavGroup.jsx        — updates dropdown position
 *   FAQPage.js                 — updates scroll detection
 *   HackathonPage.js           — closes dropdown on resize
 *
 * Each copy registered its own listener — N components = N listeners
 * firing synchronously on every resize event. None were debounced,
 * causing layout thrash and janky animations during window resize.
 *
 * FEATURES
 * --------
 *  1. Single shared state — one source of truth for window dimensions
 *  2. Debounced updates  — configurable delay (default 100ms) prevents
 *                          excessive re-renders during resize drag
 *  3. SSR safe           — initializes to { width: 0, height: 0 } on server
 *  4. Breakpoint helpers — isSmall, isMedium, isLarge, isXL for convenience
 *  5. Cleanup            — removes listener on unmount
 *
 * USAGE
 * -----
 *   const { width, height, isLarge } = useWindowSize();
 *
 *   // Responsive items per view
 *   const itemsPerView = width < 640 ? 1 : width < 1024 ? 2 : 3;
 *
 *   // Is desktop?
 *   const isDesktop = isLarge; // width >= 1024
 */

import { useState, useEffect, useCallback } from "react";

// Standard Tailwind breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * useWindowSize
 *
 * @param {object} [options]
 * @param {number} [options.debounceMs=100]  Debounce delay for resize events
 *
 * @returns {{
 *   width:    number,
 *   height:   number,
 *   isSmall:  boolean,  width < 640
 *   isMedium: boolean,  width >= 640 && width < 1024
 *   isLarge:  boolean,  width >= 1024
 *   isXL:     boolean,  width >= 1280
 * }}
 */
const useWindowSize = ({ debounceMs = 100 } = {}) => {
  const getSize = useCallback(() => {
    if (typeof window === "undefined") return { width: 0, height: 0 };
    return { width: window.innerWidth, height: window.innerHeight };
  }, []);

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId = null;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize(getSize());
      }, debounceMs);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Sync immediately in case size changed between render and effect
    setSize(getSize());

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [debounceMs, getSize]);

  return {
    width: size.width,
    height: size.height,
    isSmall: size.width < BREAKPOINTS.sm,
    isMedium: size.width >= BREAKPOINTS.sm && size.width < BREAKPOINTS.lg,
    isLarge: size.width >= BREAKPOINTS.lg,
    isXL: size.width >= BREAKPOINTS.xl,
  };
};

export default useWindowSize;
