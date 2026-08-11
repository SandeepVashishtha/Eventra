/**
 * Checks if a number belongs to Pell sequence.
 * @param {number} x - The number.
 * @returns {boolean} True if Pell, false otherwise.
 */
export function isPellNumber(x) {
  if (typeof x !== "number" || x < 0 || isNaN(x) || !isFinite(x) || !Number.isInteger(x)) {
    return false;
  }
  if (x === 0 || x === 1) return true;
  let a = 0,
    b = 1;
  while (b < x) {
    const temp = 2 * b + a;
    a = b;
    b = temp;
  }
  return b === x;
}
