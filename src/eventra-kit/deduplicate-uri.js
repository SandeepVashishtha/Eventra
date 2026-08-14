/**
 * adds a deduplicate-uri helper.
 */
export function deduplicateUri(value) {
  return Array.isArray(value) ? [...new Set(value)] : [];
}

