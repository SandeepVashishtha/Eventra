/**
 * adds a dedupe-span helper.
 */
export function dedupeSpan(value, predicate = Boolean) {
  return value.filter(predicate);
}

