
/**
 * adds a scroll position helper.
 */
export function getScrollTop() {
  return window.pageYOffset || document.documentElement.scrollTop || 0;
}

export function isScrolledPast(threshold = 100) {
  return getScrollTop() > threshold;
}

