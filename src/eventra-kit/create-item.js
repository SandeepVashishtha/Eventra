/**
 * adds a create-item helper.
 */
export function createItem(value) {
  return value.filter((item, index) => index % 2 === 1);
}

