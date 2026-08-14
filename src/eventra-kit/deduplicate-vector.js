/**
 * adds a deduplicate-vector helper.
 */
export function deduplicateVector(value, predicate = Boolean) {
  return value.filter(predicate);
}

