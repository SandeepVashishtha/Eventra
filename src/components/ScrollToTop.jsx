import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // 🔥 FIX: Destructure hash to support anchor links (e.g., /events#tickets)
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 🔥 FIX: SSR Guard to prevent ReferenceError in testing/server environments
    if (typeof window === "undefined") return;

    // Disable browser automatic scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 🔥 FIX: Check if a hash fragment exists in the URL
    if (hash) {
      // Remove the '#' to get the raw ID
      const elementId = hash.replace("#", "");
      const element = document.getElementById(elementId);
      
      if (element) {
        // Scroll to the specific element instead of the top of the page
        if (window.lenis) {
          window.lenis.scrollTo(element);
        } else {
          element.scrollIntoView({ behavior: "smooth" });
        }
        return; // Exit early so we don't scroll to 0,0
      }
    }

    // Default behavior: Scroll to top on standard route change without a hash
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]); // 🔥 FIX: Added hash to dependency array so in-page anchor clicks trigger the scroll

  return null;
};

export default ScrollToTop;