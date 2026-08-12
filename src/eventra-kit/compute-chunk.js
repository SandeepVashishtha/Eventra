/**
 * adds a compute-chunk helper.
 */
export function computeChunk(value, fallback = 0) {
  return value == null ? fallback : value;
}

