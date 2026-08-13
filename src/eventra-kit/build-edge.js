/**
 * adds a build-edge helper.
 */
export function buildEdge(value) {
  return value.filter((item, index) => index % 2 === 1);
}

