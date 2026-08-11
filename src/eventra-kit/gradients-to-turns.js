/**
 * Converts gradients to turns.
 * @param {number} gradients - The angle in gradients.
 * @returns {number} The angle in turns.
 */
export function gradientsToTurns(gradients) {
  if (typeof gradients !== "number" || isNaN(gradients) || !isFinite(gradients)) {
    return 0;
  }
  return gradients / 400;
}
