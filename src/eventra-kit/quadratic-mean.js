/**
 * Computes the quadratic mean (Root Mean Square) of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The quadratic mean, or 0 if empty/invalid.
 */
export function quadraticMean(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }
  const clean = arr.filter((v) => typeof v === "number" && !isNaN(v) && isFinite(v));
  if (clean.length === 0) {
    return 0;
  }
  const sumOfSquares = clean.reduce((sum, val) => sum + val * val, 0);
  return Math.sqrt(sumOfSquares / clean.length);
}
