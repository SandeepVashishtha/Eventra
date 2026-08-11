/**
 * Converts degrees to minutes of arc.
 * @param {number} degrees - Degrees.
 * @returns {number} Minutes.
 */
export function degreesToMinutes(degrees) {
  if (typeof degrees !== "number" || isNaN(degrees) || !isFinite(degrees)) return 0;
  return degrees * 60;
}
