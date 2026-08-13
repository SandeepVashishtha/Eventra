/**
 * adds a compute-graph helper.
 */
export function computeGraph(value) {
  return value.reduce((sum, item) => sum + item, 0) / Math.max(1, value.length);
}

