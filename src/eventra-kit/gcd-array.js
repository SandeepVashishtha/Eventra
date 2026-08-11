/**
 * Computes GCD of an array of numbers.
 * @param {number[]} arr - Array of numbers.
 * @returns {number} The GCD.
 */
export function gcdArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  const gcd = (a, b) => {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return Math.abs(a);
  };
  const clean = arr.filter(
    (v) => typeof v === "number" && !isNaN(v) && isFinite(v) && Number.isInteger(v)
  );
  if (clean.length === 0) return 0;
  let res = clean[0];
  for (let i = 1; i < clean.length; i++) {
    res = gcd(res, clean[i]);
  }
  return res;
}
