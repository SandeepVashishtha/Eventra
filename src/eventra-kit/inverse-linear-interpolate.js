/**
 * Computes the inverse linear interpolation factor.
 * @param {number} a - Start value.
 * @param {number} b - End value.
 * @param {number} value - Interpolated value.
 * @returns {number} Interpolation factor, or 0 if inputs invalid/equal.
 */
export function inverseLinearInterpolate(a, b, value) {
  if (
    typeof a !== "number" ||
    typeof b !== "number" ||
    typeof value !== "number" ||
    isNaN(a) ||
    isNaN(b) ||
    isNaN(value)
  ) {
    return 0;
  }
  if (a === b) {
    return 0;
  }
  return (value - a) / (b - a);
}
