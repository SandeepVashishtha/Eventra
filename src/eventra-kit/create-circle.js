/**
 * adds a create-circle helper.
 */
export function createCircle(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

