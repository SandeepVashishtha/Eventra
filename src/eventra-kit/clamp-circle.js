/**
 * adds a clamp-circle helper.
 */
export function clampCircle(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

