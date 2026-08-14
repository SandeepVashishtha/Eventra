/**
 * adds a dedupe-group helper.
 */
export function dedupeGroup(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value)];
}

