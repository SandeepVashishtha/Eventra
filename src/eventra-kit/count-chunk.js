/**
 * adds a count-chunk helper.
 */
export function countChunk(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

