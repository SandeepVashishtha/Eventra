/**
 * adds a dedupe-array helper.
 */
export function dedupeArray(value) {
  return Array.isArray(value) ? [...new Set(value)] : [];
}

