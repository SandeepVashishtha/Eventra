
/**
 * adds a prefix filter.
 */
export function getStartsWithList(array, prefix) {
  return array.filter((item) => String(item).startsWith(prefix));
}

