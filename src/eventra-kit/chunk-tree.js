/**
 * adds a chunk-tree helper.
 */
export function chunkTree(value, fallback = 0) {
  return value == null ? fallback : value;
}

