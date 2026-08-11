/**
 * adds a calculate-id helper.
 */
export function calculateId(value) {
  return value.map((item, index) => [index, item]);
}

