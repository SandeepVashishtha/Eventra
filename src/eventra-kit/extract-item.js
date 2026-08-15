/**
 * adds a extract-item helper.
 */
export function extractItem(value) {
  return value.filter((item, index) => index % 2 === 1);
}

