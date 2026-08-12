/**
 * adds a check-element helper.
 */
export function checkElement(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

