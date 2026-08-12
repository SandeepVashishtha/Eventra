/**
 * adds a assert-value helper.
 */
export function assertValue(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

