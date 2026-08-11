/**
 * Computes the Standard Error of the Mean (SEM) of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The standard error of the mean, or 0 if empty/invalid.
 */
export function standardError(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) {
    return 0;
  }
  const clean = arr.filter((v) => typeof v === "number" && !isNaN(v) && isFinite(v));
  if (clean.length <= 1) {
    return 0;
  }
  const mean = clean.reduce((sum, val) => sum + val, 0) / clean.length;
  const variance =
    clean.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (clean.length - 1);
  const stdDev = Math.sqrt(variance);
  return stdDev / Math.sqrt(clean.length);
}
