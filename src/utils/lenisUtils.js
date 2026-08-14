/**
 * Lenis Smooth Scroll Debouncing & Image Aspect-Ratio Bounding Box Utility (#13911)
 */

let resizeTimeout;

/**
 * Scroll to a specific element smoothly
 * @param {string|HTMLElement} target - CSS selector or target HTML element
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (target, options = {}) => {
  const element = typeof target === "string" ? document.querySelector(target) : target;
  
  if (!element) return;

  if (window.lenis) {
    window.lenis.scrollTo(element, {
      offset: 0,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options,
    });
  } else {
    element.scrollIntoView({ behavior: options.behavior || "smooth" });
  }
};

export function notifyLenisResize(delayMs = 150) {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = setTimeout(() => {
    if (typeof window !== "undefined" && window.lenis && typeof window.lenis.resize === "function") {
      window.lenis.resize();
    }
  }, delayMs);
}

/**
 * Generates a CSS aspect-ratio style object for a bounding box.
 * Used by the event grid to reserve image space and avoid layout thrashing.
 * @param {number} [width=16] - Aspect ratio width
 * @param {number} [height=9] - Aspect ratio height
 * @returns {{ aspectRatio: string, width: string, height: string }}
 */
export function getImageAspectRatioStyle(width = 16, height = 9) {
  return {
    aspectRatio: `${width} / ${height}`,
    width: "100%",
    height: "auto",
  };
}

/**
 * Stop Lenis scrolling (useful for modals)
 */
export const stopScroll = () => {
  if (window.lenis) {
    window.lenis.stop();
  }
};

/**
 * Start Lenis scrolling
 */
export const startScroll = () => {
  if (window.lenis) {
    window.lenis.start();
  }
};

/**
 * Get current scroll position
 * @returns {number} Current scroll position
 */
export const getScrollPosition = () => {
  return window.lenis ? window.lenis.scroll : window.scrollY;
};

/**
 * Automatically intercepts local anchor link clicks (`<a href="#...">`)
 * and triggers smooth Lenis scrolling.
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.selector='a[href^="#"]'] - Target links CSS selector
 * @param {number|Function} [options.offset=0] - Offset value or dynamic offset getter function
 * @returns {Function} Cleanup function to unbind event listeners
 */
export const initAnchorLinks = (options = {}) => {
  const { selector = 'a[href^="#"]', offset = 0, ...scrollOptions } = options;

  const handleAnchorClick = (e) => {
    const link = e.target.closest(selector);
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const targetElement = document.querySelector(href);
    if (!targetElement) return;

    e.preventDefault();

    // Support dynamic offset (e.g., sticky header height calculation)
    const computedOffset = typeof offset === "function" ? offset(targetElement) : offset;

    scrollToElement(targetElement, {
      offset: computedOffset,
      ...scrollOptions,
    });

    // Update URL hash cleanly without instant browser jump
    if (window.history.pushState) {
      window.history.pushState(null, "", href);
    }
  };

  document.addEventListener("click", handleAnchorClick);

  // Unbind listener for React useEffect / Vue onUnmounted cleanups
  return () => {
    document.removeEventListener("click", handleAnchorClick);
  };
};
