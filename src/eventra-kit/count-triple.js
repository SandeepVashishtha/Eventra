/**
 * adds a count-triple helper.
 */
export function countTriple(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

