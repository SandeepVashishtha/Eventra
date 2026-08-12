
/**
 * adds a property pluck helper.
 */
export function pluck(array, key) {
  return array.map((item) => item[key]);
}

