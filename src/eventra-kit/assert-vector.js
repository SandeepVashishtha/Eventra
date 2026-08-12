/**
 * adds a assert-vector helper.
 */
export function assertVector(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

