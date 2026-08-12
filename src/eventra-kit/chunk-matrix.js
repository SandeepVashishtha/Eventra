/**
 * adds a chunk-matrix helper.
 */
export function chunkMatrix(value) {
  return value.reduce((acc, item) => (item > acc ? item : acc), -Infinity);
}

