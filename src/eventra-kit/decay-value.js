/**
 * Computes the exponential decay of a value over time.
 * @param {number} value - The initial value.
 * @param {number} decayRate - The decay constant.
 * @param {number} time - Elapsed time.
 * @returns {number} Decayed value, or 0 if invalid.
 */
export function decayValue(value, decayRate, time) {
  if (
    typeof value !== "number" ||
    typeof decayRate !== "number" ||
    typeof time !== "number" ||
    isNaN(value) ||
    isNaN(decayRate) ||
    isNaN(time)
  ) {
    return 0;
  }
  return value * Math.exp(-decayRate * time);
}
