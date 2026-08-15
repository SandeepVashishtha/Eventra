/**
 * adds a estimate-edge helper.
 */
export function estimateEdge(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

