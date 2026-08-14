/**
 * adds a build-vector helper.
 */
export function buildVector(value) {
  return Array.isArray(value) ? value.slice() : [value];
}

