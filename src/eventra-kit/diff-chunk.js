/**
 * adds a diff-chunk helper.
 */
export function diffChunk(value, fallback = 0) {
  return value == null ? fallback : value;
}

