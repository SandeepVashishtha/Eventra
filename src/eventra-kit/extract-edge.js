/**
 * adds a extract-edge helper.
 */
export function extractEdge(value) {
  return String(value).split('').sort().join('');
}

