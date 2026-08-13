
/**
 * adds an array split helper.
 */
export function splitArrayAt(array, index) {
  return [array.slice(0, index), array.slice(index)];
}

