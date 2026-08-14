/**
 * adds a deduplicate-range helper.
 */
export function deduplicateRange(value) {
  return new Set(value).size;
}

