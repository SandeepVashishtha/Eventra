/**
 * adds a deduplicate-list helper.
 */
export function deduplicateList(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

