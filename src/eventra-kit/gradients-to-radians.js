/**
 * Converts gradients to radians.
 * @param {number} gradients - The angle in gradients.
 * @returns {number} The angle in radians.
 */
export function gradientsToRadians(gradients) {
  if (typeof gradients !== "number" || isNaN(gradients) || !isFinite(gradients)) {
    return 0;
  }
  return (gradients * Math.PI) / 200;
}
