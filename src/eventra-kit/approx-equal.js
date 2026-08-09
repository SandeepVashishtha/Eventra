
/**
 * adds a tolerance comparison.
 */
export function approxEqual(a, b, epsilon = 1e-9) {
  return Math.abs(a - b) <= epsilon;
}

