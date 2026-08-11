/**
 * adds a device-detection helper.
 */
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function isTouchDevice() {
  return typeof window !== 'undefined' && 'ontouchstart' in window;
}
