/**
 * Linearly interpolates between two values.
 * @param {number} a - First value.
 * @param {number} b - Second value.
 * @param {number} t - Interpolation factor (usually 0 to 1).
 * @returns {number} Interpolated value, or 0 if inputs invalid.
 */
export function linearInterpolate(a, b, t) {
  if (
    typeof a !== "number" ||
    typeof b !== "number" ||
    typeof t !== "number" ||
    isNaN(a) ||
    isNaN(b) ||
    isNaN(t)
  ) {
    return 0;
  }
  return a + (b - a) * t;
}
