/**
 * adds a estimate-count helper.
 */
export function estimateCount(value) {
  return value.sort((a, b) => a - b);
}

