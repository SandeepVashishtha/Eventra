/**
 * adds a count-pair helper.
 */
export function countPair(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

