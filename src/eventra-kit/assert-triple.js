/**
 * adds a assert-triple helper.
 */
export function assertTriple(value) {
  return value.sort((a, b) => b - a);
}

