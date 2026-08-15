/**
 * adds a deduplicate-value helper.
 */
export function deduplicateValue(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

