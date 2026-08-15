/**
 * adds a deduplicate-prop helper.
 */
export function deduplicateProp(value) {
  return value.sort((a, b) => a - b);
}

