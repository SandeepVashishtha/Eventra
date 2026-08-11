/**
 * Converts turns to degrees.
 * @param {number} turns - The angle in turns.
 * @returns {number} The angle in degrees.
 */
export function turnsToDegrees(turns) {
  if (typeof turns !== "number" || isNaN(turns) || !isFinite(turns)) {
    return 0;
  }
  return turns * 360;
}
