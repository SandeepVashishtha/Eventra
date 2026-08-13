/**
 * adds a dedupe-json helper.
 */
export function dedupeJson(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

