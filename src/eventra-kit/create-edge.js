/**
 * adds a create-edge helper.
 */
export function createEdge(value) {
  return String(value).split('').sort().join('');
}

