import { useState, useEffect } from "react";

/**
 * usePageVisibility
 *
 * Returns `true` when the current document tab is visible to the user
 * and `false` when it is hidden (minimised, in a background tab, or the
 * screen is locked).
 *
 * Uses the Page Visibility API (`document.visibilityState` / `visibilitychange`
 * event) which is supported in all modern browsers.
 *
 * Usage:
 *   const isVisible = usePageVisibility();
 *   // Pause polling, animations, or timers when isVisible === false
 *
 * @returns {boolean} Whether the page is currently visible
 */
const usePageVisibility = () => {
  const getVisibility = () => {
    if (typeof document === "undefined") return true;
    return document.visibilityState !== "hidden";
  };

  const [isVisible, setIsVisible] = useState(getVisibility);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState !== "hidden");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
};

export default usePageVisibility;
