/**
 * adds a chunk-entry helper.
 */
export function chunkEntry(value) {
  return value.some((item) => Boolean(item));
}

