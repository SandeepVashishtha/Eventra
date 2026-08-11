
/**
 * adds a numeric clamp helper.
 */
export function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

