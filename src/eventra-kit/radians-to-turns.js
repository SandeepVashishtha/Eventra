/**
 * Converts radians to turns.
 * @param {number} radians - The angle in radians.
 * @returns {number} The angle in turns.
 */
export function radiansToTurns(radians) {
  if (typeof radians !== "number" || isNaN(radians) || !isFinite(radians)) {
    return 0;
  }
  return radians / (2 * Math.PI);
}
