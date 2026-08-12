
/**
 * adds a without helper.
 */
export function arrayWithout(array, ...excluded) {
  return array.filter((item) => !excluded.includes(item));
}

