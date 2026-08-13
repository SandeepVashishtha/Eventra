
/**
 * adds a diff helper.
 */
export function differences(array) {
  return array.slice(1).map((value, i) => value - array[i]);
}

