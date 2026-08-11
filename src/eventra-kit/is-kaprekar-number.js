/**
 * Checks if a number is a Kaprekar number.
 * @param {number} n - The number to check.
 * @returns {boolean} True if Kaprekar, false otherwise.
 */
export function isKaprekarNumber(n) {
  if (typeof n !== "number" || n <= 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  if (n === 1) return true;
  const sqStr = String(n * n);
  for (let i = 1; i < sqStr.length; i++) {
    const left = parseInt(sqStr.slice(0, i), 10);
    const right = parseInt(sqStr.slice(i), 10);
    if (right > 0 && left + right === n) return true;
  }
  return false;
}
