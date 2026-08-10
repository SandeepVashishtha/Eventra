/**
 * Computes the mean absolute deviation of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The mean absolute deviation, or 0 if empty/invalid.
 */
export function averageDeviation(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }
  const clean = arr.filter((v) => typeof v === "number" && !isNaN(v) && isFinite(v));
  if (clean.length === 0) {
    return 0;
  }
  const mean = clean.reduce((sum, val) => sum + val, 0) / clean.length;
  const absDevSum = clean.reduce((sum, val) => sum + Math.abs(val - mean), 0);
  return absDevSum / clean.length;
}
