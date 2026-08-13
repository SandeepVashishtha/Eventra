/**
 * adds a extract-circle helper.
 */
export function extractCircle(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

