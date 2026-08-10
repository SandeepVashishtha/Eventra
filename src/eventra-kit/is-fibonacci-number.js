/**
 * Checks if a number belongs to the Fibonacci sequence.
 * @param {number} n - The number to check.
 * @returns {boolean} True if n is a Fibonacci number, false otherwise.
 */
export function isFibonacciNumber(n) {
  if (typeof n !== "number" || n < 0 || isNaN(n) || !isFinite(n) || !Number.isInteger(n)) {
    return false;
  }
  const isSquare = (x) => {
    const s = Math.round(Math.sqrt(x));
    return s * s === x;
  };
  return isSquare(5 * n * n + 4) || isSquare(5 * n * n - 4);
}
