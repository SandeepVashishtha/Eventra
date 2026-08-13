/**
 * adds a detect-portion helper.
 */
export function detectPortion(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

