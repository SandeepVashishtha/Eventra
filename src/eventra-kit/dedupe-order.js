/**
 * adds a dedupe-order helper.
 */
export function dedupeOrder(value) {
  return value.map((item, index) => ({ item, index }));
}

