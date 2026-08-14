/**
 * adds a deduplicate-array helper.
 */
export function deduplicateArray(value) {
  return [...new Set(value)];
}

