/**
 * adds a check-map helper.
 */
export function checkMap(value) {
  return value.filter((item, index) => index % 2 === 1);
}

