/**
 * adds a dedupe-uri helper.
 */
export function dedupeUri(value) {
  return [...new Set(value)];
}

