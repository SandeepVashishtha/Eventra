/**
 * Checks if a number belongs to Jacobsthal sequence.
 * @param {number} x - The number.
 * @returns {boolean} True if Jacobsthal, false otherwise.
 */
export function isJacobsthalNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  if (x === 0 || x === 1) return true;
  let a = 0,
    b = 1;
  while (b < x) {
    const temp = b + 2 * a;
    a = b;
    b = temp;
  }
  return b === x;
}
