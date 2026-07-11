/**
 * Lenis Smooth Scrolling Utilities
 * Provides helper functions for controlling Lenis scroll behavior
 */

/**
 * Scroll to a specific element smoothly
 * @param {string} selector - CSS selector for the target element
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (selector, options = {}) => {
  if (typeof window === 'undefined') return;
  const element = document.querySelector(selector);
  if (element && window.lenis) {
    window.lenis.scrollTo(element, {
      offset: 0,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options,
    });
  }
};

/**
 * Scroll to top of the page
 * @param {Object} options - Scroll options
 */
export const scrollToTop = (options = {}) => {
  if (typeof window === 'undefined') return;
  if (window.lenis) {
    window.lenis.scrollTo(0, {
      duration: 1.2,
      ...options,
    });
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: options.behavior || "smooth",
  });
};

/**
 * Stop Lenis scrolling (useful for modals)
 */
export const stopScroll = () => {
  if (typeof window === 'undefined') return;
  if (window.lenis) {
    window.lenis.stop();
  }
};

/**
 * Start Lenis scrolling
 */
export const startScroll = () => {
  if (typeof window === 'undefined') return;
  if (window.lenis) {
    window.lenis.start();
  }
};

/**
 * Get current scroll position
 * @returns {number} Current scroll position
 */
export const getScrollPosition = () => {
  if (typeof window === 'undefined') return 0;
  return window.lenis ? window.lenis.scroll : window.scrollY;
};
