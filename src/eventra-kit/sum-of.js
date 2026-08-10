
/**
 * adds a value sum helper.
 */
export function sumOf(array) {
  return array.reduce((acc, n) => acc + Number(n || 0), 0);
}

