
/**
 * adds a unique concat helper.
 */
export function uniqueConcat(...arrays) {
  return [...new Set(arrays.flat())];
}

