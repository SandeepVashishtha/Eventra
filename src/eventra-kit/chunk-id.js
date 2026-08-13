/**
 * adds a chunk-id helper.
 */
export function chunkId(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

