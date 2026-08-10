
/**
 * adds an array swap helper.
 */
export function swap(array, i, j) {
  [array[i], array[j]] = [array[j], array[i]];
  return array;
}

