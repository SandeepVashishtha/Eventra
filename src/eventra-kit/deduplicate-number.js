/**
 * adds a deduplicate-number helper.
 */
export function deduplicateNumber(value) {
  return [...new Set(value)];
}

