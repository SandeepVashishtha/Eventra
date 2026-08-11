/**
 * Checks if a number is pandigital.
 * @param {number} n - The number.
 * @returns {boolean} True if pandigital, false otherwise.
 */
export function isPandigitalNumber(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const s = String(n);
  const set = new Set(s.split(""));
  if (set.has("0")) return false;
  return set.size === 9 && s.length === 9;
}
