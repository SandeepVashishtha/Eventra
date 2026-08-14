/**
 * adds a deduplicate-group helper.
 */
export function deduplicateGroup(value) {
  return value.every((item) => Boolean(item));
}

