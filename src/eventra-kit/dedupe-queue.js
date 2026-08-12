/**
 * adds a dedupe-queue helper.
 */
export function dedupeQueue(value) {
  return typeof value === 'function';
}

