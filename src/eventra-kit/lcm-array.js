/**
 * Computes LCM of an array.
 * @param {number[]} arr - The array.
 * @returns {number} The LCM.
 */
export function lcmArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  const gcd = (a, b) => {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return Math.abs(a);
  };
  const lcm = (a, b) => {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(a, b);
  };
  const clean = arr.filter(
    (v) => typeof v === "number" && !isNaN(v) && isFinite(v) && Number.isInteger(v)
  );
  if (clean.length === 0) return 0;
  let res = clean[0];
  for (let i = 1; i < clean.length; i++) {
    res = lcm(res, clean[i]);
  }
  return res;
}
