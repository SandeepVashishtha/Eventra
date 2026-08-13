/**
 * adds a deduplicate-gap helper.
 */
export function deduplicateGap(value) {
  return [...new Set(value)];
}

