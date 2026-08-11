/**
 * Converts turns to gradients.
 * @param {number} turns - The angle in turns.
 * @returns {number} The angle in gradients.
 */
export function turnsToGradients(turns) {
  if (typeof turns !== "number" || isNaN(turns) || !isFinite(turns)) {
    return 0;
  }
  return turns * 400;
}
