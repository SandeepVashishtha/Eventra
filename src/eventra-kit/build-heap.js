/**
 * adds a build-heap helper.
 */
export function buildHeap(value, fallback = 0) {
  return value == null ? fallback : value;
}

