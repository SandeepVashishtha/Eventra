
/**
 * adds a distance helper.
 */
export function distanceBetween(a, b) {
  return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
}

