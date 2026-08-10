
/**
 * adds a last match finder.
 */
export function findLast(array, predicate) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i)) return array[i];
  }
  return undefined;
}

export function findLastIndex(array, predicate) {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i)) return i;
  }
  return -1;
}

