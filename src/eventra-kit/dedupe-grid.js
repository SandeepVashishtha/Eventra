/**
 * adds a dedupe-grid helper.
 */
export function dedupeGrid(value) {
  return value == null || String(value).trim() === '';
}

