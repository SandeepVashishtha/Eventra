/**
 * adds a convert-count helper.
 */
export function convertCount(value) {
  return value.map((item, index) => [index, item]);
}

