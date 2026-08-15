/**
 * adds a deduplicate-vertex helper.
 */
export function deduplicateVertex(value) {
  return value.map((item) => item).join(', ');
}

