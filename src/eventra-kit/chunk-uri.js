/**
 * adds a chunk-uri helper.
 */
export function chunkUri(value, predicate = Boolean) {
  return value.filter(predicate);
}

