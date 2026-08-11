/**
 * Converts degrees to turns.
 * @param {number} degrees - The angle in degrees.
 * @returns {number} The angle in turns.
 */
export function degreesToTurns(degrees) {
  if (typeof degrees !== "number" || isNaN(degrees) || !isFinite(degrees)) {
    return 0;
  }
  return degrees / 360;
}
