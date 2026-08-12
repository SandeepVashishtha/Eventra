
/**
 * adds a duplicate counter.
 */
export function getDuplicateCount(array) {
  return array.length - new Set(array).size;
}

