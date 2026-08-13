/**
 * adds a dedupe-box helper.
 */
export function dedupeBox(value) {
  return [...new Set(value)];
}

