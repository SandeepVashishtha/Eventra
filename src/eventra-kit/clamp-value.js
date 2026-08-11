/**
 * Clamps value between min and max.
 * @param {number} val - Value.
 * @param {number} min - Minimum limit.
 * @param {number} max - Maximum limit.
 * @returns {number} The clamped value.
 */
export function clampValue(val, min, max) {
  if (
    typeof val !== "number" ||
    typeof min !== "number" ||
    typeof max !== "number" ||
    isNaN(val) ||
    isNaN(min) ||
    isNaN(max)
  ) {
    return 0;
  }
  return Math.min(Math.max(val, min), max);
}
