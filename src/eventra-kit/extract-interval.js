/**
 * adds a extract-interval helper.
 */
export function extractInterval(value) {
  return value.filter((item, index) => index % 2 === 0);
}

