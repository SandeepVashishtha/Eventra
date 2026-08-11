/**
 * Interpolates between two arrays element-wise.
 * @param {number[]} arr1 - First array.
 * @param {number[]} arr2 - Second array.
 * @param {number} t - Factor.
 * @returns {number[]} Interpolated array.
 */
export function lerpArray(arr1, arr2, t) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2) || typeof t !== "number" || isNaN(t)) {
    return [];
  }
  const len = Math.min(arr1.length, arr2.length);
  const res = [];
  for (let i = 0; i < len; i++) {
    const a = arr1[i];
    const b = arr2[i];
    if (typeof a === "number" && typeof b === "number" && !isNaN(a) && !isNaN(b)) {
      res.push(a + (b - a) * t);
    } else {
      res.push(0);
    }
  }
  return res;
}
