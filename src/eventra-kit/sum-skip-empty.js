
/**
 * adds a null-safe sum helper.
 */
export function sumSkipEmpty(array) {
  return array.filter((n) => typeof n === 'number').reduce((acc, n) => acc + n, 0);
}

