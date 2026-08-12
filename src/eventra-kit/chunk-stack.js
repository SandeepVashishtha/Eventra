/**
 * adds a chunk-stack helper.
 */
export function chunkStack(value, fallback = 0) {
  return value == null ? fallback : value;
}

