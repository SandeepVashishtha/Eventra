/**
 * adds a assert-object helper.
 */
export function assertObject(value) {
  return value.every((item) => Boolean(item));
}

