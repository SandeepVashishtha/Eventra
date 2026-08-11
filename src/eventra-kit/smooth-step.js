/**
 * Computes smoothstep Hermite interpolation.
 * @param {number} edge0 - Start edge.
 * @param {number} edge1 - End edge.
 * @param {number} x - Value.
 * @returns {number} Interpolated value.
 */
export function smoothStep(edge0, edge1, x) {
  if (
    typeof edge0 !== "number" ||
    typeof edge1 !== "number" ||
    typeof x !== "number" ||
    isNaN(edge0) ||
    isNaN(edge1) ||
    isNaN(x)
  ) {
    return 0;
  }
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}
