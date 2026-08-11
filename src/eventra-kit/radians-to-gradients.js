/**
 * Converts radians to gradients.
 * @param {number} radians - The angle in radians.
 * @returns {number} The angle in gradients.
 */
export function radiansToGradients(radians) {
  if (typeof radians !== "number" || isNaN(radians) || !isFinite(radians)) {
    return 0;
  }
  return (radians * 200) / Math.PI;
}
