/**
 * adds a diff-graph helper.
 */
export function diffGraph(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

