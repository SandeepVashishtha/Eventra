/**
 * adds a chunk-name helper.
 */
export function chunkName(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

