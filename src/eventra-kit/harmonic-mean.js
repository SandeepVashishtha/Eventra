/**
 * Computes the harmonic mean of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The harmonic mean, or 0 if empty/invalid/contains 0.
 */
export function harmonicMean(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }
  const clean = arr.filter((v) => typeof v === "number" && !isNaN(v) && isFinite(v));
  if (clean.length === 0) {
    return 0;
  }
  let sumOfReciprocals = 0;
  for (const val of clean) {
    if (val === 0) {
      return 0;
    }
    sumOfReciprocals += 1 / val;
  }
  return clean.length / sumOfReciprocals;
}
