/**
 * adds a dedupe-segment helper.
 */
export function dedupeSegment(value, predicate = Boolean) {
  return value.filter(predicate);
}

