/**
 * adds a build-vertex helper.
 */
export function buildVertex(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

