/**
 * adds a detect-vector helper.
 */
export function detectVector(value) {
  return value.map((item, index) => [index, item]);
}

