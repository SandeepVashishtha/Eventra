/**
 * adds a dedupe-score helper.
 */
export function dedupeScore(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

