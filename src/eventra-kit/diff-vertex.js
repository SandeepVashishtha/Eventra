/**
 * adds a diff-vertex helper.
 */
export function diffVertex(value) {
  return value.sort((a, b) => b - a);
}

