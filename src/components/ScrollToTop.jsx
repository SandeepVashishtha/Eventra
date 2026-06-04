import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // 🔥 FIX: Destructure hash to support anchor links (e.g., /events#tickets)
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 🔥 FIX: Cleaner SSR Guard from master branch
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 🔥 FIX: Check if a hash fragment exists in the URL
    if (hash) {
      const elementId = hash.replace("#", "");
      
      if (elementId) {
        // 🔥 FIX: Race Condition Guard.
        // Defer execution until the next frame to ensure React has fully painted 
        // the newly mounted page's DOM elements before we search for the ID.
        window.requestAnimationFrame(() => {
          const element = document.getElementById(elementId);
          
          if (element) {
            // 🔥 FIX: Strict type check from master to prevent Lenis initialization crashes
            if (window.lenis && typeof window.lenis.scrollTo === "function") {
              window.lenis.scrollTo(element);
            } else {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }
        });
        
        return; // Exit early so we don't execute the scroll to 0,0 below
      }
    }

    // Default behavior: Scroll to top on standard route change without a hash
    // 🔥 FIX: Strict type check from master
    if (window.lenis && typeof window.lenis.scrollTo === "function") {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]); // Hash dependency ensures in-page anchor clicks trigger the scroll

  return null;
};

export default ScrollToTop;