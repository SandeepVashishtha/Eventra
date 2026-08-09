
/**
 * adds a last-element helper.
 */
export function last(array, fallback) {
  return array.length ? array[array.length - 1] : fallback;
}

