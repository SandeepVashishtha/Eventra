/**
 * Converts gradients to degrees.
 * @param {number} gradients - The angle in gradients.
 * @returns {number} The angle in degrees.
 */
export function gradientsToDegrees(gradients) {
  if (typeof gradients !== "number" || isNaN(gradients) || !isFinite(gradients)) {
    return 0;
  }
  return (gradients * 360) / 400;
}
