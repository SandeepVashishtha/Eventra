
/**
 * adds an array union helper.
 */
export function unionArrays(...arrays) {
  return [...new Set(arrays.flat())];
}

