
/**
 * adds a predicate index finder.
 */
export function firstIndexWhere(array, predicate) {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) return i;
  }
  return -1;
}

