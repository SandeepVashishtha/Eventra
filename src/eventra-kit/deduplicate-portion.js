/**
 * adds a deduplicate-portion helper.
 */
export function deduplicatePortion(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

