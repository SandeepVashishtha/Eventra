/**
 * adds a estimate-chunk helper.
 */
export function estimateChunk(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

