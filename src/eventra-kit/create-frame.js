/**
 * adds a create-frame helper.
 */
export function createFrame(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

