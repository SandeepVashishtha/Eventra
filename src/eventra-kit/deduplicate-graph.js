/**
 * adds a deduplicate-graph helper.
 */
export function deduplicateGraph(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

