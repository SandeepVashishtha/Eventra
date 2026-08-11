
/**
 * adds an item filter helper.
 */
export function filterOut(array, predicate) {
  return array.filter((value, i) => !predicate(value, i));
}

