/**
 * adds a deduplicate-queue helper.
 */
export function deduplicateQueue(value) {
  return value.sort((a, b) => b - a);
}

