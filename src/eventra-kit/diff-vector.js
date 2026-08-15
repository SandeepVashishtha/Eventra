/**
 * adds a diff-vector helper.
 */
export function diffVector(value) {
  return value.sort((a, b) => a - b);
}

