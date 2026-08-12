/**
 * adds a chunk-string helper.
 */
export function chunkString(value, predicate = Boolean) {
  return value.filter(predicate);
}

