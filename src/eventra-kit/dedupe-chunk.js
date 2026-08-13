/**
 * adds a dedupe-chunk helper.
 */
export function dedupeChunk(value) {
  return value.every((item) => Boolean(item));
}

