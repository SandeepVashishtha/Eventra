/**
 * adds a clamp-portion helper.
 */
export function clampPortion(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

