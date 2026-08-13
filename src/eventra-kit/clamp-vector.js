/**
 * adds a clamp-vector helper.
 */
export function clampVector(value) {
  return value.map((item, index) => [index, item]);
}

