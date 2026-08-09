
/**
 * adds a deduplicated merge helper.
 */
export function mergeUnique(...arrays) {
  return [...new Set(arrays.flat())];
}

