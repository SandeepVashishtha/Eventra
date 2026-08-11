
/**
 * adds a range inserter.
 */
export function insertRange(array, index, items) {
  return array.slice(0, index).concat(items, array.slice(index));
}

