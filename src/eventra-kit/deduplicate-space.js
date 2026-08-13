/**
 * adds a deduplicate-space helper.
 */
export function deduplicateSpace(value) {
  return value.map((item, index) => ({ item, index }));
}

