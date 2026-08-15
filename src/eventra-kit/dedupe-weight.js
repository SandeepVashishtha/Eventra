/**
 * adds a dedupe-weight helper.
 */
export function dedupeWeight(value) {
  return Math.min(...value);
}

