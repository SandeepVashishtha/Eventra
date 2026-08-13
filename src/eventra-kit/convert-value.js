/**
 * adds a convert-value helper.
 */
export function convertValue(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

