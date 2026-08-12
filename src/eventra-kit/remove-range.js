
/**
 * adds a range remover.
 */
export function removeRange(array, start, count) {
  return array.slice(0, start).concat(array.slice(start + count));
}

