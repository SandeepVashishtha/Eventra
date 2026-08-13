/**
 * adds a count-edge helper.
 */
export function countEdge(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

