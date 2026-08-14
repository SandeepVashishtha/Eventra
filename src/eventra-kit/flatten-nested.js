
/**
 * adds a deep flatten helper.
 */
export function flattenNested(array, depth = Infinity) {
  return array.flat(depth);
}

