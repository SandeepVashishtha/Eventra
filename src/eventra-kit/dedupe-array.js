/**
 * adds a dedupe-array helper.
 */
export function dedupeArray(value) {
  return [...new Set(value)];
}

