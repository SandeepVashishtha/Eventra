/**
 * Converts turns to radians.
 * @param {number} turns - The angle in turns.
 * @returns {number} The angle in radians.
 */
export function turnsToRadians(turns) {
  if (typeof turns !== "number" || isNaN(turns) || !isFinite(turns)) {
    return 0;
  }
  return turns * 2 * Math.PI;
}
