/**
 * adds a estimate-pair helper.
 */
export function estimatePair(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

