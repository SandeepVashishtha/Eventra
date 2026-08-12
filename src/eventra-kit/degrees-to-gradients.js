/**
 * Converts degrees to gradients.
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in gradients.
 */
export function degreesToGradients(degrees) {
  if (typeof degrees !== "number" || isNaN(degrees) || !isFinite(degrees)) {
    return 0;
  }
  return (degrees * 400) / 360;
}
