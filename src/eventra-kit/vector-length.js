
/**
 * adds a vector helper.
 */
export function vectorLength(coords) {
  return Math.sqrt(coords.reduce((acc, c) => acc + c ** 2, 0));
}

