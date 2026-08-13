/**
 * adds a create-interval helper.
 */
export function createInterval(value) {
  return value.filter((item, index) => index % 2 === 0);
}

