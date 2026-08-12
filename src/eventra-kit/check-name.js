/**
 * adds a check-name helper.
 */
export function checkName(value) {
  return value.map((item, index) => [index, item]);
}

