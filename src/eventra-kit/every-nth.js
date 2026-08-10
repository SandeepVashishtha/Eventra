
/**
 * adds an nth-item helper.
 */
export function everyNth(array, n) {
  return array.filter((_, i) => i % n === 0);
}

