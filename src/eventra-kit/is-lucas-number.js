/**
 * Checks if a number belongs to Lucas sequence.
 * @param {number} x - The number.
 * @returns {boolean} True if Lucas number, false otherwise.
 */
export function isLucasNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  if (x === 1 || x === 2) return true;
  let a = 2,
    b = 1;
  while (b < x) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b === x;
}
