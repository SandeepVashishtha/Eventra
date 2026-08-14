/**
 * adds a dedupe-number helper.
 */
export function dedupeNumber(value) {
  return [...new Set(value)];
}

